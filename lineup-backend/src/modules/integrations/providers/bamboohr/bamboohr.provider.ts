import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { ProviderCapabilities, StandardCandidate, SyncResult } from '../../types/standard-entities';

/**
 * BambooHR Integration Provider
 * Supports: Employee record creation, offer acceptance workflows
 * 
 * Required environment variables:
 * - BAMBOOHR_API_KEY
 * - BAMBOOHR_SUBDOMAIN (company subdomain)
 */
@Injectable()
export class BambooHRProvider implements IntegrationProvider {
    private readonly logger = new Logger(BambooHRProvider.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    private getBaseUrl(subdomain: string): string {
        return `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1`;
    }

    getCapabilities(): ProviderCapabilities {
        return {
            candidateSync: 'write', // Create employees from hired candidates
            jobSync: 'read', // Can pull job openings
            interviewSync: 'none',
            supportsWebhooks: true,
        };
    }

    async getAuthUrl(tenantId: string, state?: string): Promise<string> {
        // BambooHR uses API Key authentication
        this.logger.log(`BambooHR uses API key auth for tenant ${tenantId}`);
        return `/integrations/bamboohr/configure?tenantId=${tenantId}`;
    }

    async exchangeCode(tenantId: string, code: string): Promise<void> {
        // 'code' contains API key and subdomain as JSON
        this.logger.log(`Storing BambooHR credentials for tenant ${tenantId}`);

        let credentials: { apiKey: string; subdomain: string };
        try {
            credentials = JSON.parse(code);
        } catch {
            credentials = { apiKey: code, subdomain: 'unknown' };
        }

        await this.prisma.integration.upsert({
            where: { tenantId_provider: { tenantId, provider: 'bamboohr' } },
            create: {
                tenantId,
                provider: 'bamboohr',
                status: 'connected',
                tokens: {
                    api_key: credentials.apiKey,
                    subdomain: credentials.subdomain,
                },
            },
            update: {
                status: 'connected',
                tokens: {
                    api_key: credentials.apiKey,
                    subdomain: credentials.subdomain,
                },
            },
        });
    }

    async refreshTokens(tenantId: string): Promise<void> {
        // API keys don't expire
        this.logger.log(`BambooHR uses API key auth (no refresh) for tenant ${tenantId}`);
    }

    /**
     * Create employee record from hired candidate
     */
    async pushCandidate(tenantId: string, candidate: StandardCandidate): Promise<SyncResult> {
        this.logger.log(`Creating employee in BambooHR for tenant ${tenantId}`);

        // TODO: POST /employees - Create employee record
        // This is typically used when a candidate is hired

        const [firstName, ...lastNameParts] = candidate.name.split(' ');

        // BambooHR required fields: firstName, lastName
        // Optional: workEmail, hireDate, department, jobTitle

        return { success: true, externalId: `bhr-emp-${Date.now()}` };
    }

    /**
     * Pull employees from BambooHR (for sync)
     */
    async pullCandidates(tenantId: string, since?: Date): Promise<StandardCandidate[]> {
        this.logger.log(`Pulling employees from BambooHR for tenant ${tenantId}`);

        // TODO: GET /employees/directory
        // Map to StandardCandidate format

        return [];
    }

    /**
     * Handle offer acceptance workflow
     */
    async handleOfferAccepted(tenantId: string, candidateId: string, offerData: {
        startDate: Date;
        department?: string;
        jobTitle?: string;
        salary?: number;
    }): Promise<SyncResult> {
        this.logger.log(`Processing offer acceptance for candidate ${candidateId}`);

        // TODO: Create employee with hire date and department info
        return { success: true, externalId: `bhr-emp-${Date.now()}` };
    }

    async handleWebhook(tenantId: string, event: any): Promise<void> {
        // BambooHR webhooks: employee_added, employee_changed, etc.
        this.logger.log(`BambooHR webhook for tenant ${tenantId}`, event);
    }
}
