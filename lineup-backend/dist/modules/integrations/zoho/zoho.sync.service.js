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
    async syncLeads(tenantId) {
        this.logger.log(`Starting Zoho Leads sync for tenant: ${tenantId}`);
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'leads');
        let imported = 0;
        let updated = 0;
        let errors = 0;
        try {
            const res = await axios_1.default.get(`${this.zohoApi}/Leads`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` }
            });
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
                            where: { tenantId, email: mapped.email }
                        });
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
                                source: 'ZOHO_CRM',
                                externalId: zohoId,
                                externalSource: 'ZOHO_CRM',
                                rawExternalData: rec,
                                tags: [],
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
    async syncContacts(tenantId) {
        this.logger.log(`Starting Zoho Contacts sync for tenant: ${tenantId}`);
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'contacts');
        let imported = 0;
        let updated = 0;
        let errors = 0;
        try {
            const res = await axios_1.default.get(`${this.zohoApi}/Contacts`, {
                headers: { Authorization: `Zoho-oauthtoken ${token}` }
            });
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
                            where: { tenantId, email: mapped.email }
                        });
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
                                source: 'ZOHO_CRM',
                                externalId: zohoId,
                                externalSource: 'ZOHO_CRM',
                                rawExternalData: rec,
                                tags: [],
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
    async syncAll(tenantId, module = 'leads') {
        this.logger.log(`Starting full Zoho sync for tenant: ${tenantId}`);
        const results = {
            stages: null,
            users: null,
            candidates: null,
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
            if (module === 'leads') {
                results.candidates = await this.syncLeads(tenantId);
            }
            else {
                results.candidates = await this.syncContacts(tenantId);
            }
        }
        catch (e) {
            this.logger.error(`Candidates sync failed: ${e.message}`);
            results.candidates = { error: e.message };
        }
        this.logger.log(`Full Zoho sync complete: ${JSON.stringify(results)}`);
        return results;
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