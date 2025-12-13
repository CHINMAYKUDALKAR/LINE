import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../common/prisma.service';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';

@Injectable()
export class ZohoSyncService {
    private zohoApi = 'https://www.zohoapis.com/crm/v2';

    constructor(
        private prisma: PrismaService,
        private oauth: ZohoOAuthService,
        private fieldmap: ZohoFieldMapService,
    ) { }

    async syncLeads(tenantId: string) {
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'leads');

        try {
            const res = await axios.get(`${this.zohoApi}/Leads`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` }
            });

            const records = res.data?.data || [];
            for (const rec of records) {
                const mapped = this.applyMapping(rec, mapping);

                const existing = await this.prisma.candidate.findFirst({
                    where: { tenantId, email: mapped.email }
                });

                if (existing) {
                    await this.prisma.candidate.update({
                        where: { id: existing.id },
                        data: {
                            name: mapped.name,
                            phone: mapped.phone
                        }
                    });
                } else {
                    await this.prisma.candidate.create({
                        data: {
                            tenantId,
                            name: mapped.name || 'Unknown',
                            email: mapped.email,
                            phone: mapped.phone,
                            stage: 'imported',
                            source: 'zoho',
                            tags: []
                        }
                    });
                }
            }

            await this.prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: { status: 'active' }
            });

            return { imported: records.length };
        } catch (e) {
            // If token invalid, could trigger refresh here or let processor retry
            throw e;
        }
    }

    async syncContacts(tenantId: string) {
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'contacts');

        try {
            const res = await axios.get(`${this.zohoApi}/Contacts`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` }
            });

            const records = res.data?.data || [];
            for (const rec of records) {
                const mapped = this.applyMapping(rec, mapping);

                const existing = await this.prisma.candidate.findFirst({
                    where: { tenantId, email: mapped.email }
                });

                if (existing) {
                    await this.prisma.candidate.update({
                        where: { id: existing.id },
                        data: {
                            name: mapped.name,
                            phone: mapped.phone
                        }
                    });
                } else {
                    await this.prisma.candidate.create({
                        data: {
                            tenantId,
                            name: mapped.name || 'Unknown',
                            email: mapped.email,
                            phone: mapped.phone,
                            stage: 'imported',
                            source: 'zoho'
                        }
                    });
                }
            }
            return { imported: records.length };
        } catch (e) {
            throw e;
        }
    }

    applyMapping(record: any, mapping: Record<string, string>) {
        const result: any = {};
        // If no mapping, try default field names
        if (!mapping || Object.keys(mapping).length === 0) {
            result.name = record.Full_Name || `${record.First_Name} ${record.Last_Name}`.trim();
            result.email = record.Email;
            result.phone = record.Phone;
        } else {
            for (const [localField, zohoField] of Object.entries(mapping)) {
                result[localField] = record[zohoField];
            }
        }
        return result;
    }
}
