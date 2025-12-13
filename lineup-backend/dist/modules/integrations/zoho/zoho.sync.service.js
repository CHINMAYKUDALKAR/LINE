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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoSyncService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../../../common/prisma.service");
const zoho_oauth_service_1 = require("./zoho.oauth.service");
const zoho_fieldmap_service_1 = require("./zoho.fieldmap.service");
let ZohoSyncService = class ZohoSyncService {
    prisma;
    oauth;
    fieldmap;
    zohoApi = 'https://www.zohoapis.com/crm/v2';
    constructor(prisma, oauth, fieldmap) {
        this.prisma = prisma;
        this.oauth = oauth;
        this.fieldmap = fieldmap;
    }
    async syncLeads(tenantId) {
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'leads');
        try {
            const res = await axios_1.default.get(`${this.zohoApi}/Leads`, {
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
                }
                else {
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
        }
        catch (e) {
            throw e;
        }
    }
    async syncContacts(tenantId) {
        const token = await this.oauth.getAccessToken(tenantId);
        const mapping = await this.fieldmap.getMapping(tenantId, 'contacts');
        try {
            const res = await axios_1.default.get(`${this.zohoApi}/Contacts`, {
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
                }
                else {
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
        }
        catch (e) {
            throw e;
        }
    }
    applyMapping(record, mapping) {
        const result = {};
        if (!mapping || Object.keys(mapping).length === 0) {
            result.name = record.Full_Name || `${record.First_Name} ${record.Last_Name}`.trim();
            result.email = record.Email;
            result.phone = record.Phone;
        }
        else {
            for (const [localField, zohoField] of Object.entries(mapping)) {
                result[localField] = record[zohoField];
            }
        }
        return result;
    }
};
exports.ZohoSyncService = ZohoSyncService;
exports.ZohoSyncService = ZohoSyncService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zoho_oauth_service_1.ZohoOAuthService,
        zoho_fieldmap_service_1.ZohoFieldMapService])
], ZohoSyncService);
//# sourceMappingURL=zoho.sync.service.js.map