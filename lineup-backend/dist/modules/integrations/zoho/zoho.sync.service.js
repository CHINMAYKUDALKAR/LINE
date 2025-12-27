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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ZohoSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoSyncService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../../../common/prisma.service");
const zoho_oauth_service_1 = require("./zoho.oauth.service");
const zoho_fieldmap_service_1 = require("./zoho.fieldmap.service");
const ZOHO_STATUS_TO_STAGE = {
    'Attempted to Contact': 'SCREENING',
    'Contact in Future': 'APPLIED',
    'Contacted': 'SCREENING',
    'Junk Lead': 'REJECTED',
    'Lost Lead': 'REJECTED',
    'Not Contacted': 'APPLIED',
    'Pre-Qualified': 'PHONE_SCREEN',
    'Not Qualified': 'REJECTED',
    'Qualified': 'INTERVIEW',
    'Closed Won': 'HIRED',
    'Closed Lost': 'REJECTED',
};
let ZohoSyncService = ZohoSyncService_1 = class ZohoSyncService {
    prisma;
    oauth;
    fieldmap;
    logger = new common_1.Logger(ZohoSyncService_1.name);
    zohoApi = 'https://www.zohoapis.in/crm/v2';
    constructor(prisma, oauth, fieldmap) {
        this.prisma = prisma;
        this.oauth = oauth;
        this.fieldmap = fieldmap;
    }
    async syncLeads(tenantId, since) {
        this.logger.log(`Starting Zoho Leads sync for tenant: ${tenantId}${since ? ` (delta since ${since.toISOString()})` : ' (full sync)'}`);
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'leads');
        let imported = 0;
        let updated = 0;
        let errors = 0;
        try {
            let apiUrl = `${this.zohoApi}/Leads`;
            const params = {};
            if (since) {
                const isoDate = since.toISOString().replace('T', ' ').substring(0, 19);
                apiUrl = `${this.zohoApi}/coql`;
            }
            const res = since
                ? await axios_1.default.post(apiUrl, {
                    select_query: `SELECT * FROM Leads WHERE Modified_Time >= '${since.toISOString().replace('T', ' ').substring(0, 19)}'`
                }, { headers: { Authorization: `Zoho-oauthtoken ${token}` } })
                : await axios_1.default.get(apiUrl, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
            const records = res.data?.data || [];
            this.logger.log(`Found ${records.length} leads in Zoho`);
            for (const rec of records) {
                try {
                    const mapped = this.applyMapping(rec, mapping);
                    const zohoId = rec.id;
                    const stage = this.mapZohoStatusToStage(rec.Lead_Status);
                    let existing = await this.prisma.candidate.findFirst({
                        where: {
                            tenantId,
                            externalId: zohoId,
                            externalSource: 'ZOHO_CRM',
                        }
                    });
                    if (!existing && mapped.email) {
                        existing = await this.prisma.candidate.findFirst({
                            where: { tenantId, email: { equals: mapped.email, mode: 'insensitive' } }
                        });
                    }
                    if (!existing && mapped.phone) {
                        const normalizedPhone = mapped.phone.replace(/\D/g, '');
                        if (normalizedPhone.length >= 10) {
                            existing = await this.prisma.candidate.findFirst({
                                where: { tenantId, phone: { contains: normalizedPhone.slice(-10) } }
                            });
                        }
                    }
                    if (existing) {
                        await this.prisma.candidate.update({
                            where: { id: existing.id },
                            data: {
                                name: mapped.name || existing.name,
                                phone: mapped.phone || existing.phone,
                                roleTitle: mapped.roleTitle || existing.roleTitle,
                                externalId: zohoId,
                                externalSource: 'ZOHO_CRM',
                                rawExternalData: rec,
                                ...(existing.stage === 'APPLIED' || existing.stage === 'imported' ? { stage } : {}),
                            }
                        });
                        updated++;
                        ;
                    }
                    else {
                        await this.prisma.candidate.create({
                            data: {
                                tenantId,
                                name: mapped.name || 'Unknown',
                                email: mapped.email,
                                phone: mapped.phone,
                                roleTitle: mapped.roleTitle,
                                stage: 'APPLIED',
                                source: 'ZOHO_LEAD',
                                externalId: zohoId,
                                externalSource: 'ZOHO_CRM',
                                rawExternalData: rec,
                                tags: ['zoho-lead'],
                            }
                        });
                        imported++;
                    }
                }
                catch (err) {
                    this.logger.error(`Failed to sync lead ${rec.id}: ${err.message}`);
                    errors++;
                }
            }
            await this.prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: {
                    status: 'connected',
                    lastSyncedAt: new Date(),
                }
            });
            const result = { imported, updated, errors, total: records.length };
            this.logger.log(`Zoho Leads sync complete: ${JSON.stringify(result)}`);
            return result;
        }
        catch (e) {
            this.logger.error(`Zoho Leads sync failed: ${e.message}`);
            await this.prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: { status: 'error', lastError: e.message }
            });
            throw e;
        }
    }
    async syncContacts(tenantId, since) {
        this.logger.log(`Starting Zoho Contacts sync for tenant: ${tenantId}${since ? ` (delta since ${since.toISOString()})` : ' (full sync)'}`);
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'contacts');
        let imported = 0;
        let updated = 0;
        let errors = 0;
        try {
            let apiUrl = `${this.zohoApi}/Contacts`;
            const res = since
                ? await axios_1.default.post(`${this.zohoApi}/coql`, {
                    select_query: `SELECT * FROM Contacts WHERE Modified_Time >= '${since.toISOString().replace('T', ' ').substring(0, 19)}'`
                }, { headers: { Authorization: `Zoho-oauthtoken ${token}` } })
                : await axios_1.default.get(apiUrl, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
            const records = res.data?.data || [];
            this.logger.log(`Found ${records.length} contacts in Zoho`);
            for (const rec of records) {
                try {
                    const mapped = this.applyMapping(rec, mapping);
                    const zohoId = rec.id;
                    let existing = await this.prisma.candidate.findFirst({
                        where: {
                            tenantId,
                            externalId: zohoId,
                            externalSource: 'ZOHO_CRM',
                        }
                    });
                    if (!existing && mapped.email) {
                        existing = await this.prisma.candidate.findFirst({
                            where: { tenantId, email: { equals: mapped.email, mode: 'insensitive' } }
                        });
                    }
                    if (!existing && mapped.phone) {
                        const normalizedPhone = mapped.phone.replace(/\D/g, '');
                        if (normalizedPhone.length >= 10) {
                            existing = await this.prisma.candidate.findFirst({
                                where: { tenantId, phone: { contains: normalizedPhone.slice(-10) } }
                            });
                        }
                    }
                    if (existing) {
                        await this.prisma.candidate.update({
                            where: { id: existing.id },
                            data: {
                                name: mapped.name || existing.name,
                                phone: mapped.phone || existing.phone,
                                roleTitle: mapped.roleTitle || existing.roleTitle,
                                externalId: zohoId,
                                externalSource: 'ZOHO_CRM',
                                rawExternalData: rec,
                            }
                        });
                        updated++;
                    }
                    else {
                        await this.prisma.candidate.create({
                            data: {
                                tenantId,
                                name: mapped.name || 'Unknown',
                                email: mapped.email,
                                phone: mapped.phone,
                                roleTitle: mapped.roleTitle,
                                stage: 'APPLIED',
                                source: 'ZOHO_CONTACT',
                                externalId: zohoId,
                                externalSource: 'ZOHO_CRM',
                                rawExternalData: rec,
                                tags: ['zoho-contact'],
                            }
                        });
                        imported++;
                    }
                }
                catch (err) {
                    this.logger.error(`Failed to sync contact ${rec.id}: ${err.message}`);
                    errors++;
                }
            }
            await this.prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: {
                    status: 'connected',
                    lastSyncedAt: new Date(),
                }
            });
            const result = { imported, updated, errors, total: records.length };
            this.logger.log(`Zoho Contacts sync complete: ${JSON.stringify(result)}`);
            return result;
        }
        catch (e) {
            this.logger.error(`Zoho Contacts sync failed: ${e.message}`);
            await this.prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: { status: 'error', lastError: e.message }
            });
            throw e;
        }
    }
    applyMapping(record, mapping) {
        const result = {};
        if (!mapping || Object.keys(mapping).length === 0) {
            result.name = record.Full_Name ||
                `${record.First_Name || ''} ${record.Last_Name || ''}`.trim() ||
                'Unknown';
            result.email = record.Email;
            result.phone = record.Phone || record.Mobile;
            result.roleTitle = record.Title || record.Designation;
        }
        else {
            for (const [localField, zohoField] of Object.entries(mapping)) {
                result[localField] = record[zohoField];
            }
        }
        return result;
    }
    mapZohoStatusToStage(zohoStatus) {
        if (!zohoStatus)
            return 'APPLIED';
        return ZOHO_STATUS_TO_STAGE[zohoStatus] || 'APPLIED';
    }
    async syncStages(tenantId) {
        this.logger.log(`Starting Zoho Stages sync for tenant: ${tenantId}`);
        const token = await this.oauth.getAccessToken(tenantId);
        let imported = 0;
        let updated = 0;
        try {
            const res = await axios_1.default.get(`${this.zohoApi}/settings/fields`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` },
                params: { module: 'Leads' }
            });
            const fields = res.data?.fields || [];
            const statusField = fields.find((f) => f.api_name === 'Lead_Status' || f.field_label === 'Lead Status');
            const stages = statusField?.pick_list_values || [];
            this.logger.log(`Found ${stages.length} stages in Zoho`);
            for (let i = 0; i < stages.length; i++) {
                const stage = stages[i];
                const stageName = stage.display_value || stage.actual_value;
                const stageKey = stageName.toUpperCase().replace(/\s+/g, '_');
                const existing = await this.prisma.hiringStage.findFirst({
                    where: {
                        tenantId,
                        name: stageName,
                    }
                });
                if (existing) {
                    await this.prisma.hiringStage.update({
                        where: { id: existing.id },
                        data: { order: i }
                    });
                    updated++;
                }
                else {
                    await this.prisma.hiringStage.create({
                        data: {
                            tenantId,
                            name: stageName,
                            key: stageKey,
                            order: i,
                            color: this.getStageColor(i),
                        }
                    });
                    imported++;
                }
            }
            const result = { imported, updated, total: stages.length };
            this.logger.log(`Zoho Stages sync complete: ${JSON.stringify(result)}`);
            return result;
        }
        catch (e) {
            this.logger.error(`Zoho Stages sync failed: ${e.message}`);
            throw e;
        }
    }
    getStageColor(index) {
        const colors = [
            '#3B82F6',
            '#8B5CF6',
            '#EC4899',
            '#F59E0B',
            '#10B981',
            '#EF4444',
            '#6366F1',
            '#14B8A6',
        ];
        return colors[index % colors.length];
    }
    async syncUsers(tenantId) {
        this.logger.log(`Starting Zoho Users sync for tenant: ${tenantId}`);
        const token = await this.oauth.getAccessToken(tenantId);
        let imported = 0;
        let updated = 0;
        let errors = 0;
        try {
            const res = await axios_1.default.get(`${this.zohoApi}/users`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` },
                params: { type: 'AllUsers' }
            });
            const users = res.data?.users || [];
            this.logger.log(`Found ${users.length} users in Zoho`);
            for (const zohoUser of users) {
                try {
                    if (zohoUser.status === 'deleted' || zohoUser.status === 'inactive') {
                        continue;
                    }
                    const email = zohoUser.email?.toLowerCase();
                    if (!email)
                        continue;
                    const zohoUserId = zohoUser.id;
                    const fullName = zohoUser.full_name || zohoUser.name || 'Unknown';
                    let existingUser = await this.prisma.user.findFirst({
                        where: { email }
                    });
                    if (existingUser) {
                        this.logger.debug(`User ${email} already exists in Lineup`);
                        updated++;
                    }
                    else {
                        const newUser = await this.prisma.user.create({
                            data: {
                                email,
                                name: fullName,
                                password: '',
                                emailVerified: false,
                            }
                        });
                        await this.prisma.userTenant.create({
                            data: {
                                userId: newUser.id,
                                tenantId,
                                role: this.mapZohoRoleToLineup(zohoUser.role?.name),
                                status: 'ACTIVE',
                            }
                        });
                        imported++;
                        this.logger.log(`Created user: ${email} with role ${zohoUser.role?.name}`);
                    }
                }
                catch (err) {
                    this.logger.error(`Failed to sync user ${zohoUser.email}: ${err.message}`);
                    errors++;
                }
            }
            const result = { imported, updated, errors, total: users.length };
            this.logger.log(`Zoho Users sync complete: ${JSON.stringify(result)}`);
            return result;
        }
        catch (e) {
            this.logger.error(`Zoho Users sync failed: ${e.message}`);
            throw e;
        }
    }
    mapZohoRoleToLineup(zohoRole) {
        const roleMap = {
            'Administrator': 'ADMIN',
            'CEO': 'ADMIN',
            'Manager': 'MANAGER',
            'Standard': 'RECRUITER',
        };
        return roleMap[zohoRole] || 'RECRUITER';
    }
    async syncAll(tenantId, module = 'leads', since) {
        this.logger.log(`Starting Zoho sync for tenant: ${tenantId}, module: ${module}${since ? ' (delta)' : ' (full)'}`);
        const results = {
            stages: null,
            users: null,
            candidates: null,
            syncType: since ? 'delta' : 'full',
            module,
        };
        try {
            results.stages = await this.syncStages(tenantId);
        }
        catch (e) {
            this.logger.error(`Stages sync failed: ${e.message}`);
            results.stages = { error: e.message };
        }
        try {
            results.users = await this.syncUsers(tenantId);
        }
        catch (e) {
            this.logger.error(`Users sync failed: ${e.message}`);
            results.users = { error: e.message };
        }
        try {
            if (module === 'both') {
                const leadsResult = await this.syncLeads(tenantId, since);
                const contactsResult = await this.syncContacts(tenantId, since);
                results.candidates = {
                    leads: leadsResult,
                    contacts: contactsResult,
                    totalImported: (leadsResult.imported || 0) + (contactsResult.imported || 0),
                    totalUpdated: (leadsResult.updated || 0) + (contactsResult.updated || 0),
                    totalErrors: (leadsResult.errors || 0) + (contactsResult.errors || 0),
                };
            }
            else if (module === 'contacts') {
                results.candidates = await this.syncContacts(tenantId, since);
            }
            else {
                results.candidates = await this.syncLeads(tenantId, since);
            }
        }
        catch (e) {
            this.logger.error(`Candidates sync failed: ${e.message}`);
            results.candidates = { error: e.message };
        }
        this.logger.log(`Zoho sync complete: ${JSON.stringify(results)}`);
        return results;
    }
    async demandDrivenSync(tenantId, module = 'leads') {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: { tenantId, provider: 'zoho' },
            },
            select: { lastSyncedAt: true },
        });
        const since = integration?.lastSyncedAt || undefined;
        return this.syncAll(tenantId, module, since);
    }
    isSyncStale(lastSyncedAt, thresholdMinutes = 15) {
        if (!lastSyncedAt)
            return true;
        const staleThreshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
        return lastSyncedAt < staleThreshold;
    }
};
exports.ZohoSyncService = ZohoSyncService;
exports.ZohoSyncService = ZohoSyncService = ZohoSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zoho_oauth_service_1.ZohoOAuthService,
        zoho_fieldmap_service_1.ZohoFieldMapService])
], ZohoSyncService);
//# sourceMappingURL=zoho.sync.service.js.map