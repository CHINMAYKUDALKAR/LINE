import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { ZohoOAuthService } from './zoho.oauth';
import { ZohoApiService } from './zoho.api';
import { getZohoMapping } from './zoho.mapping';
import { applyMapping, reverseMapping } from '../../utils/mapping.util';

@Injectable()
export class ZohoProvider implements IntegrationProvider {
    constructor(
        private prisma: PrismaService,
        private zohoOAuth: ZohoOAuthService,
        private zohoApi: ZohoApiService,
    ) { }

    /**
     * Get OAuth authorization URL
     */
    async getAuthUrl(tenantId: string, state?: string): Promise<string> {
        return this.zohoOAuth.getAuthUrl(tenantId);
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCode(tenantId: string, code: string): Promise<void> {
        await this.zohoOAuth.exchangeCode(tenantId, code);
    }

    /**
     * Refresh access tokens
     */
    async refreshTokens(tenantId: string): Promise<void> {
        await this.zohoOAuth.refreshTokens(tenantId);
    }

    /**
     * Push a candidate to Zoho CRM as a Contact
     */
    async pushCandidate(tenantId: string, candidate: any): Promise<any> {
        try {
            // Get integration settings for mapping
            const integration = await this.prisma.integration.findUnique({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
            });

            const mappingConfig = getZohoMapping(integration?.settings);

            // Apply field mapping
            const zohoContact = applyMapping(candidate, mappingConfig);

            // Check if contact already exists by email
            if (candidate.email) {
                const existingContact = await this.zohoApi.searchContactByEmail(
                    tenantId,
                    candidate.email,
                );

                if (existingContact) {
                    // Update existing contact
                    return await this.zohoApi.updateContact(
                        tenantId,
                        existingContact.id,
                        zohoContact,
                    );
                }
            }

            // Create new contact
            return await this.zohoApi.createContact(tenantId, zohoContact);
        } catch (error) {
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
                data: {
                    lastError: `Push candidate failed: ${error.message}`,
                },
            });
            throw error;
        }
    }

    /**
     * Pull candidates from Zoho CRM
     */
    async pullCandidates(tenantId: string, since?: Date): Promise<any[]> {
        try {
            // Get integration settings for mapping
            const integration = await this.prisma.integration.findUnique({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
            });

            const mappingConfig = getZohoMapping(integration?.settings);

            // Fetch contacts from Zoho
            let zohoContacts: any[];
            if (since) {
                zohoContacts = await this.zohoApi.getContactsSince(tenantId, since);
            } else {
                zohoContacts = await this.zohoApi.getContacts(tenantId);
            }

            // Apply reverse mapping to convert Zoho contacts to candidates
            const candidates = zohoContacts.map((contact) =>
                reverseMapping(contact, mappingConfig),
            );

            // Update last synced timestamp
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
                data: {
                    lastSyncedAt: new Date(),
                    lastError: null,
                },
            });

            return candidates;
        } catch (error) {
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
                data: {
                    lastError: `Pull candidates failed: ${error.message}`,
                },
            });
            throw error;
        }
    }

    /**
     * Handle incoming webhook from Zoho CRM
     */
    async handleWebhook(tenantId: string, event: any): Promise<void> {
        // Zoho webhook events typically contain module, operation, and data
        const { module, operation, data } = event;

        if (module === 'Contacts') {
            // Handle contact-related events
            if (operation === 'create' || operation === 'update') {
                // Could trigger a pull sync or process the specific contact
                console.log(`Zoho webhook: ${operation} contact for tenant ${tenantId}`);
            }
        }

        // Update last synced timestamp
        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider: 'zoho',
                },
            },
            data: {
                lastSyncedAt: new Date(),
            },
        });
    }
}
