"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var IntegrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const provider_factory_1 = require("./provider.factory");
const oauth_util_1 = require("./utils/oauth.util");
const mapping_util_1 = require("./utils/mapping.util");
const audit_service_1 = require("../audit/audit.service");
const zoho_api_1 = require("./providers/zoho/zoho.api");
let IntegrationsService = IntegrationsService_1 = class IntegrationsService {
    prisma;
    providerFactory;
    auditService;
    zohoApi;
    syncQueue;
    logger = new common_1.Logger(IntegrationsService_1.name);
    syncRateLimiter = new Map();
    constructor(prisma, providerFactory, auditService, zohoApi, syncQueue) {
        this.prisma = prisma;
        this.providerFactory = providerFactory;
        this.auditService = auditService;
        this.zohoApi = zohoApi;
        this.syncQueue = syncQueue;
    }
    async listIntegrations(tenantId) {
        const integrations = await this.prisma.integration.findMany({
            where: { tenantId },
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
        return integrations.map(i => ({
            ...i,
            config: i.settings?.config || undefined,
            settings: undefined,
        }));
    }
    async getIntegration(tenantId, provider) {
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
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        return integration;
    }
    async connect(tenantId, provider, userId) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        const providerInstance = this.providerFactory.getProvider(provider);
        const authUrl = await providerInstance.getAuthUrl(tenantId);
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.connect.initiated',
            metadata: { provider },
        });
        return { authUrl, provider };
    }
    async callback(provider, code, state, userId) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        let tenantId;
        let companyDomain;
        if (provider === 'salesforce') {
            tenantId = state;
        }
        else {
            const parsed = (0, oauth_util_1.parseState)(state);
            tenantId = parsed.tenantId;
            companyDomain = parsed.companyDomain;
        }
        const providerInstance = this.providerFactory.getProvider(provider);
        if (provider === 'bamboohr' && companyDomain) {
            await providerInstance.exchangeCode(tenantId, code, companyDomain);
        }
        else {
            await providerInstance.exchangeCode(tenantId, code);
        }
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.connect.completed',
            metadata: { provider },
        });
        return { success: true, provider };
    }
    async updateMapping(tenantId, provider, mappingDto, userId) {
        const newMapping = {
            mappings: mappingDto.mappings,
            direction: mappingDto.direction,
        };
        if (!(0, mapping_util_1.validateMapping)(newMapping)) {
            throw new common_1.BadRequestException('Invalid mapping configuration');
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
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        const existingSettings = integration.settings || {};
        const existingMapping = existingSettings.mapping || { mappings: [], direction: 'bidirectional' };
        const mergedMapping = (0, mapping_util_1.mergeMappings)(existingMapping, newMapping);
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
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.mapping.updated',
            metadata: { provider, mappingCount: mergedMapping.mappings.length },
        });
        return { success: true, mapping: mergedMapping };
    }
    async updateConfig(tenantId, provider, config) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
        });
        if (!integration) {
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        const existingSettings = integration.settings || {};
        const updatedSettings = {
            ...existingSettings,
            config: {
                ...(existingSettings.config || {}),
                ...config,
            },
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
        return { success: true, config: updatedSettings.config };
    }
    async syncNow(tenantId, provider, userId, since, module) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
        });
        if (!integration) {
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        if (integration.status === 'auth_required') {
            throw new common_1.BadRequestException(`Cannot sync: Zoho authentication expired. Please reconnect the integration to resume syncing.`);
        }
        if (integration.status !== 'connected') {
            throw new common_1.BadRequestException(`Integration ${provider} is not connected`);
        }
        const key = `${tenantId}:${provider}`;
        const now = Date.now();
        const limit = this.syncRateLimiter.get(key);
        if (limit && limit.resetAt > now) {
            if (limit.count >= 5) {
                throw new common_1.BadRequestException('Rate limit exceeded: max 5 syncs per hour');
            }
            limit.count++;
        }
        else {
            this.syncRateLimiter.set(key, { count: 1, resetAt: now + 3600000 });
        }
        let syncModule = module;
        if (!syncModule) {
            const settings = integration.settings;
            if (provider === 'salesforce') {
                syncModule = settings?.config?.salesforceModule || 'all';
            }
            else if (provider === 'zoho') {
                syncModule = settings?.config?.zohoModule || 'leads';
            }
            else {
                syncModule = 'all';
            }
        }
        await this.syncQueue.add('sync', {
            tenantId,
            provider,
            since: since?.toISOString(),
            module: syncModule,
        }, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.sync.triggered',
            metadata: { provider, since: since?.toISOString() },
        });
        return { success: true, message: 'Sync job enqueued' };
    }
    async handleWebhook(provider, payload) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        const tenantId = await this.extractTenantFromWebhook(provider, payload);
        if (!tenantId) {
            throw new common_1.BadRequestException('Could not identify tenant from webhook');
        }
        const providerInstance = this.providerFactory.getProvider(provider);
        if (providerInstance.handleWebhook) {
            await providerInstance.handleWebhook(tenantId, payload);
        }
        await this.syncQueue.add('sync', {
            tenantId,
            provider,
            triggeredBy: 'webhook',
        });
        return { success: true };
    }
    async disconnect(tenantId, provider, userId) {
        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            data: {
                status: 'pending',
                tokens: null,
            },
        });
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.disconnected',
            metadata: { provider },
        });
        return { success: true };
    }
    async extractTenantFromWebhook(provider, payload) {
        let externalId = null;
        if (provider === 'zoho' && payload.organization_id) {
            externalId = payload.organization_id;
        }
        else if (provider === 'google_calendar' && payload.channelId) {
            externalId = payload.channelId;
        }
        else if (provider === 'outlook_calendar' && payload.subscriptionId) {
            externalId = payload.subscriptionId;
        }
        if (!externalId) {
            this.logger.warn(`Could not extract external ID from ${provider} webhook payload`);
            return null;
        }
        const integration = await this.prisma.integration.findFirst({
            where: {
                provider,
                settings: {
                    path: ['externalId'],
                    equals: externalId,
                },
            },
            select: { tenantId: true },
        });
        if (!integration) {
            this.logger.warn(`No integration found for ${provider} with external ID: ${externalId}`);
            return null;
        }
        return integration.tenantId;
    }
    async getWebhookEvents(tenantId, provider, limit = 50) {
        const safeLimit = Math.min(limit || 50, 200);
        const integration = await this.getIntegration(tenantId, provider);
        if (!integration) {
            return { events: [] };
        }
        const events = [];
        const eventTypes = ['candidate.created', 'candidate.updated', 'job.closed', 'application.submitted'];
        const statuses = ['success', 'failed', 'retrying', 'pending'];
        for (let i = 0; i < Math.min(safeLimit, 10); i++) {
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
    async getMetrics(tenantId, provider) {
        const integration = await this.getIntegration(tenantId, provider);
        if (!integration) {
            return null;
        }
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const statusCounts = await this.prisma.integrationSyncLog.groupBy({
            by: ['status'],
            where: {
                tenantId,
                provider,
                createdAt: { gte: since },
            },
            _count: true,
        });
        let totalSyncs = 0, successfulSyncs = 0, failedSyncs = 0, queuedJobs = 0;
        for (const row of statusCounts) {
            totalSyncs += row._count;
            if (row.status === 'SUCCESS')
                successfulSyncs = row._count;
            if (row.status === 'FAILED')
                failedSyncs = row._count;
            if (row.status === 'PENDING' || row.status === 'IN_PROGRESS') {
                queuedJobs += row._count;
            }
        }
        const completedSyncs = await this.prisma.integrationSyncLog.findMany({
            where: {
                tenantId,
                provider,
                status: 'SUCCESS',
                createdAt: { gte: since },
                completedAt: { not: null },
            },
            select: {
                createdAt: true,
                completedAt: true,
            },
            take: 100,
        });
        let avgLatencyMs = 0;
        if (completedSyncs.length > 0) {
            const totalLatency = completedSyncs.reduce((sum, s) => {
                return sum + (s.completedAt.getTime() - s.createdAt.getTime());
            }, 0);
            avgLatencyMs = Math.round(totalLatency / completedSyncs.length);
        }
        const recordsProcessed = await this.prisma.integrationSyncLog.count({
            where: {
                tenantId,
                provider,
                status: 'SUCCESS',
                createdAt: { gte: since },
            },
        });
        const lastError = await this.prisma.integrationSyncLog.findFirst({
            where: {
                tenantId,
                provider,
                status: 'FAILED',
            },
            orderBy: { createdAt: 'desc' },
            select: { errorMessage: true },
        });
        const successRate = totalSyncs > 0
            ? Math.round((successfulSyncs / totalSyncs) * 1000) / 10
            : 100;
        return {
            integrationId: integration.id,
            period: 'Last 7 days',
            totalSyncs,
            successfulSyncs,
            failedSyncs,
            successRate,
            avgLatencyMs,
            recordsProcessed,
            queuedJobs,
            lastError: lastError?.errorMessage || null,
        };
    }
    async getFieldSchemas(tenantId, provider) {
        const integration = await this.getIntegration(tenantId, provider);
        if (!integration) {
            return { sourceFields: [], targetFields: [], mappings: [] };
        }
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
        const mappings = integration.mappingConfig?.mappings || [];
        return { sourceFields, targetFields, mappings };
    }
    async getIntegrationStatus(tenantId, provider) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: { tenantId, provider },
            },
        });
        if (!integration) {
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const logs = await this.prisma.integrationSyncLog.groupBy({
            by: ['status'],
            where: {
                tenantId,
                provider,
                createdAt: { gte: since },
            },
            _count: true,
        });
        let total = 0, success = 0, failed = 0, pending = 0;
        for (const log of logs) {
            total += log._count;
            if (log.status === 'SUCCESS')
                success = log._count;
            if (log.status === 'FAILED')
                failed = log._count;
            if (log.status === 'PENDING' || log.status === 'IN_PROGRESS') {
                pending += log._count;
            }
        }
        let capabilities = {
            candidateSync: 'none',
            jobSync: 'none',
            interviewSync: 'none',
            supportsWebhooks: false,
        };
        try {
            const providerInstance = this.providerFactory.getProvider(provider);
            if (providerInstance.getCapabilities) {
                capabilities = providerInstance.getCapabilities();
            }
        }
        catch (e) {
            this.logger.warn(`Could not get capabilities for provider ${provider}:`, e);
        }
        return {
            connected: integration.status === 'connected',
            provider,
            lastSyncAt: integration.lastSyncedAt,
            lastError: integration.lastError,
            capabilities,
            stats: {
                total,
                success,
                failed,
                pending,
                successRate: total > 0 ? Math.round((success / total) * 100) : 0,
            },
        };
    }
    async getSyncLogs(tenantId, provider, limit = 50, status) {
        const safeLimit = Math.min(limit || 50, 200);
        const where = { tenantId, provider };
        if (status) {
            where.status = status;
        }
        return this.prisma.integrationSyncLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: safeLimit,
            select: {
                id: true,
                eventType: true,
                direction: true,
                entityType: true,
                entityId: true,
                externalId: true,
                status: true,
                errorMessage: true,
                retryCount: true,
                createdAt: true,
                completedAt: true,
            },
        });
    }
    async getFailureSummary(tenantId, provider) {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const errors = await this.prisma.integrationSyncLog.findMany({
            where: {
                tenantId,
                provider,
                status: 'FAILED',
                createdAt: { gte: since },
            },
            select: {
                errorMessage: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const errorMap = new Map();
        for (const error of errors) {
            const message = error.errorMessage || 'Unknown error';
            const existing = errorMap.get(message);
            if (existing) {
                existing.count++;
                if (error.createdAt > existing.lastOccurred) {
                    existing.lastOccurred = error.createdAt;
                }
            }
            else {
                errorMap.set(message, { count: 1, lastOccurred: error.createdAt });
            }
        }
        const recentErrors = Array.from(errorMap.entries())
            .map(([message, data]) => ({ message, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            recentErrors,
            totalFailures24h: errors.length,
        };
    }
    async testZohoConnection(tenantId) {
        try {
            return await this.zohoApi.testConnection(tenantId);
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to connect to Zoho CRM',
            };
        }
    }
    async getZohoContacts(tenantId, page = 1, perPage = 20) {
        try {
            const contacts = await this.zohoApi.getContacts(tenantId, page, perPage);
            return {
                success: true,
                data: contacts,
                pagination: {
                    page,
                    perPage,
                    total: contacts.length,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch contacts',
                data: [],
            };
        }
    }
    async getZohoLeads(tenantId, page = 1, perPage = 20) {
        try {
            return {
                success: true,
                message: 'Leads endpoint - add getLeads() to ZohoApiService to implement',
                data: [],
                pagination: {
                    page,
                    perPage,
                    total: 0,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to fetch leads',
                data: [],
            };
        }
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = IntegrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, bullmq_2.InjectQueue)('integration-sync')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        provider_factory_1.ProviderFactory,
        audit_service_1.AuditService,
        zoho_api_1.ZohoApiService,
        bullmq_1.Queue])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map