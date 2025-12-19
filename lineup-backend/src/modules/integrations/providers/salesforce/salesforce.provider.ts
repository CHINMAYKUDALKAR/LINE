import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { ProviderCapabilities, StandardCandidate, SyncResult } from '../../types/standard-entities';
import { SalesforceOAuthService } from './salesforce.oauth';
import { SalesforceApiService } from './salesforce.api';

/**
 * Salesforce Integration Provider
 * Supports: Lead/Contact sync, Opportunity mapping
 */
@Injectable()
export class SalesforceProvider implements IntegrationProvider {
    constructor(
        private prisma: PrismaService,
        private oauthService: SalesforceOAuthService,
        private apiService: SalesforceApiService,
    ) { }

    /**
     * Get provider capabilities
     */
    getCapabilities(): ProviderCapabilities {
        return {
            candidateSync: 'bidirectional',
            jobSync: 'write', // Map to Opportunities
            interviewSync: 'none',
            supportsWebhooks: true,
        };
    }

    /**
     * Get OAuth authorization URL
     */
    async getAuthUrl(tenantId: string, state?: string): Promise<string> {
        return this.oauthService.getAuthUrl(tenantId);
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCode(tenantId: string, code: string): Promise<void> {
        await this.oauthService.exchangeCode(tenantId, code);
    }

    /**
     * Refresh access tokens
     */
    async refreshTokens(tenantId: string): Promise<void> {
        await this.oauthService.refreshTokens(tenantId);
    }

    /**
     * Push a candidate to Salesforce as a Lead or Contact
     */
    async pushCandidate(tenantId: string, candidate: StandardCandidate): Promise<SyncResult> {
        try {
            // Check if Lead/Contact already exists by email
            let existingId: string | null = null;
            if (candidate.email) {
                const existing = await this.apiService.searchByEmail(tenantId, 'Lead', candidate.email);
                existingId = existing?.id || null;
            }

            if (existingId) {
                // Update existing record
                const updated = await this.apiService.updateRecord(tenantId, 'Lead', existingId, {
                    FirstName: candidate.name.split(' ')[0],
                    LastName: candidate.name.split(' ').slice(1).join(' ') || 'Unknown',
                    Phone: candidate.phone,
                    LeadSource: candidate.source,
                });
                return { success: updated, externalId: existingId };
            }

            // Create new Lead
            const [firstName, ...lastNameParts] = candidate.name.split(' ');
            const result = await this.apiService.createLead(tenantId, {
                firstName: firstName || 'Unknown',
                lastName: lastNameParts.join(' ') || 'Unknown',
                email: candidate.email,
                phone: candidate.phone,
                company: 'Unknown', // Required by Salesforce
                title: candidate.roleTitle,
                source: candidate.source,
            });

            return { success: result.success, externalId: result.id };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: message };
        }
    }

    /**
     * Pull candidates from Salesforce
     */
    async pullCandidates(tenantId: string, since?: Date): Promise<StandardCandidate[]> {
        const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const records = await this.apiService.getModifiedRecords(tenantId, 'Lead', sinceDate);

        return records.map((record: any) => ({
            externalId: record.Id,
            name: `${record.FirstName || ''} ${record.LastName || ''}`.trim(),
            email: record.Email,
            phone: record.Phone,
            source: record.LeadSource || 'Salesforce',
            notes: record.Description,
            metadata: { salesforceId: record.Id },
        }));
    }

    /**
     * Handle incoming webhook from Salesforce
     */
    async handleWebhook(tenantId: string, event: any): Promise<void> {
        // Salesforce Platform Events or Outbound Messages
        console.log(`Salesforce webhook for tenant ${tenantId}`, event);
    }
}
