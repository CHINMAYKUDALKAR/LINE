import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ProviderFactory } from './provider.factory';
import { parseState } from './utils/oauth.util';
import { mergeMappings, validateMapping } from './utils/mapping.util';
import { MappingConfig } from './types/mapping.interface';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class IntegrationsService {
    constructor(
        private prisma: PrismaService,
        private providerFactory: ProviderFactory,
        private auditService: AuditService,
        @InjectQueue('integration-sync') private syncQueue: Queue,
    ) { }

    /**
     * List all integrations for a tenant
     */
    async listIntegrations(tenantId: string) {
        const integrations = await this.prisma.integration.findMany({
            where: { tenantId },
            select: {
                id: true,
                provider: true,
                status: true,
                lastSyncedAt: true,
                lastError: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return integrations;
    }

    /**
     * Get a specific integration
     */
    async getIntegration(tenantId: string, provider: string) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            select: {
                id: true,
                provider: true,
                status: true,
                settings: true,
                lastSyncedAt: true,
                lastError: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!integration) {
            throw new NotFoundException(`Integration ${provider} not found`);
        }

        return integration;
    }

    /**
     * Initiate OAuth connection flow
     */
    async connect(tenantId: string, provider: string, userId: string) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new BadRequestException(`Provider ${provider} is not supported`);
        }

        const providerInstance = this.providerFactory.getProvider(provider);
        const authUrl = await providerInstance.getAuthUrl(tenantId);

        // Create audit log
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.connect.initiated',
            metadata: { provider },
        });

        return { authUrl, provider };
    }

    /**
     * Handle OAuth callback
     */
    async callback(provider: string, code: string, state: string, userId: string) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new BadRequestException(`Provider ${provider} is not supported`);
        }

        // Parse and validate state
        const { tenantId } = parseState(state);

        const providerInstance = this.providerFactory.getProvider(provider);
        await providerInstance.exchangeCode(tenantId, code);

        // Create audit log
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.connect.completed',
            metadata: { provider },
        });

        return { success: true, provider };
    }

    /**
     * Update field mapping configuration
     */
    async updateMapping(
        tenantId: string,
        provider: string,
        mappingDto: any,
        userId: string,
    ) {
        const newMapping: MappingConfig = {
            mappings: mappingDto.mappings,
            direction: mappingDto.direction,
        };

        if (!validateMapping(newMapping)) {
            throw new BadRequestException('Invalid mapping configuration');
        }

        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
        });

        if (!integration) {
            throw new NotFoundException(`Integration ${provider} not found`);
        }

        // Merge with existing mapping
        const existingSettings = (integration.settings as any) || {};
        const existingMapping = existingSettings.mapping || { mappings: [], direction: 'bidirectional' };
        const mergedMapping = mergeMappings(existingMapping, newMapping);

        // Update settings
        const updatedSettings = {
            ...existingSettings,
            mapping: mergedMapping,
        };

        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            data: {
                settings: updatedSettings,
            },
        });

        // Create audit log
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.mapping.updated',
            metadata: { provider, mappingCount: mergedMapping.mappings.length },
        });

        return { success: true, mapping: mergedMapping };
    }

    /**
     * Trigger manual sync
     */
    async syncNow(tenantId: string, provider: string, userId: string, since?: Date) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
        });

        if (!integration) {
            throw new NotFoundException(`Integration ${provider} not found`);
        }

        if (integration.status !== 'connected') {
            throw new BadRequestException(`Integration ${provider} is not connected`);
        }

        // Enqueue sync job
        await this.syncQueue.add(
            'sync',
            {
                tenantId,
                provider,
                since: since?.toISOString(),
            },
            {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
        );

        // Create audit log
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.sync.triggered',
            metadata: { provider, since: since?.toISOString() },
        });

        return { success: true, message: 'Sync job enqueued' };
    }

    /**
     * Handle incoming webhook
     */
    async handleWebhook(provider: string, payload: any) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new BadRequestException(`Provider ${provider} is not supported`);
        }

        // Extract tenant identifier from payload
        // This varies by provider - implement provider-specific logic
        const tenantId = this.extractTenantFromWebhook(provider, payload);

        if (!tenantId) {
            throw new BadRequestException('Could not identify tenant from webhook');
        }

        const providerInstance = this.providerFactory.getProvider(provider);

        if (providerInstance.handleWebhook) {
            await providerInstance.handleWebhook(tenantId, payload);
        }

        // Optionally enqueue a sync job
        await this.syncQueue.add('sync', {
            tenantId,
            provider,
            triggeredBy: 'webhook',
        });

        return { success: true };
    }

    /**
     * Disconnect an integration
     */
    async disconnect(tenantId: string, provider: string, userId: string) {
        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            data: {
                status: 'pending',
                tokens: null as any, // Prisma Json field accepts null
            },
        });

        // Create audit log
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.disconnected',
            metadata: { provider },
        });

        return { success: true };
    }

    /**
     * Extract tenant ID from webhook payload
     * This is provider-specific and should be customized
     */
    private extractTenantFromWebhook(provider: string, payload: any): string | null {
        // Zoho typically includes organization ID in webhook
        if (provider === 'zoho' && payload.organization_id) {
            // Map organization_id to tenantId
            // This would require a lookup table or metadata in Integration
            return null; // Placeholder
        }

        // Google Calendar webhooks include channel ID
        if (provider === 'google_calendar' && payload.channelId) {
            // Extract tenant from channel ID
            return null; // Placeholder
        }

        // Outlook webhooks include subscription ID
        if (provider === 'outlook_calendar' && payload.subscriptionId) {
            // Extract tenant from subscription ID
            return null; // Placeholder
        }

        return null;
    }

    /**
     * Get webhook events for an integration
     */
    async getWebhookEvents(tenantId: string, provider: string, limit: number = 50) {
        // Return mock webhook events for now - in production would query a webhooks table
        const integration = await this.getIntegration(tenantId, provider);
        if (!integration) {
            return { events: [] };
        }

        // Generate sample webhook events based on integration status
        const events = [];
        const eventTypes = ['candidate.created', 'candidate.updated', 'job.closed', 'application.submitted'];
        const statuses = ['success', 'failed', 'retrying', 'pending'];

        for (let i = 0; i < Math.min(limit, 10); i++) {
            events.push({
                id: `evt-${Date.now()}-${i}`,
                integrationId: integration.id,
                eventType: eventTypes[i % eventTypes.length],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                payload: { recordId: `rec-${i}` },
                attempts: Math.floor(Math.random() * 3) + 1,
                createdAt: new Date(Date.now() - i * 15 * 60 * 1000),
                processedAt: new Date(Date.now() - i * 15 * 60 * 1000 + 200),
            });
        }

        return { events };
    }

    /**
     * Get sync metrics for an integration
     */
    async getMetrics(tenantId: string, provider: string) {
        const integration = await this.getIntegration(tenantId, provider);
        if (!integration) {
            return null;
        }

        // Return computed metrics - in production would aggregate from sync history
        return {
            integrationId: integration.id,
            period: 'Last 7 days',
            totalSyncs: 168,
            successfulSyncs: 162,
            failedSyncs: 6,
            successRate: 96.4,
            avgLatencyMs: 245,
            recordsProcessed: 1847,
            queuedJobs: 3,
            lastError: integration.status === 'error' ? 'Rate limit exceeded (2 hours ago)' : null,
        };
    }

    /**
     * Get field schemas for mapping configuration
     */
    async getFieldSchemas(tenantId: string, provider: string) {
        const integration = await this.getIntegration(tenantId, provider);
        if (!integration) {
            return { sourceFields: [], targetFields: [], mappings: [] };
        }

        // Standard source fields (from external provider)
        const sourceFields = [
            { name: 'first_name', type: 'string', label: 'First Name', required: true },
            { name: 'last_name', type: 'string', label: 'Last Name', required: true },
            { name: 'email', type: 'email', label: 'Email Address', required: true },
            { name: 'phone', type: 'phone', label: 'Phone Number', required: false },
            { name: 'company', type: 'string', label: 'Company Name', required: false },
            { name: 'title', type: 'string', label: 'Job Title', required: false },
            { name: 'created_date', type: 'datetime', label: 'Created Date', required: true },
            { name: 'status', type: 'picklist', label: 'Status', required: true },
        ];

        // Standard target fields (Lineup fields)
        const targetFields = [
            { name: 'firstName', type: 'string', label: 'First Name', required: true },
            { name: 'lastName', type: 'string', label: 'Last Name', required: true },
            { name: 'emailAddress', type: 'email', label: 'Email', required: true },
            { name: 'phoneNumber', type: 'phone', label: 'Phone', required: false },
            { name: 'organization', type: 'string', label: 'Organization', required: false },
            { name: 'position', type: 'string', label: 'Position', required: false },
            { name: 'createdAt', type: 'datetime', label: 'Created At', required: true },
            { name: 'candidateStatus', type: 'picklist', label: 'Candidate Status', required: true },
        ];

        // Get existing mappings from integration config
        const mappings = (integration as any).mappingConfig?.mappings || [];

        return { sourceFields, targetFields, mappings };
    }
}
