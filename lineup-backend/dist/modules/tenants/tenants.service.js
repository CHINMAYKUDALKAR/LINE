"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const crypto = __importStar(require("crypto"));
let TenantsService = class TenantsService {
    prisma;
    domainQueue;
    constructor(prisma, domainQueue) {
        this.prisma = prisma;
        this.domainQueue = domainQueue;
    }
    async create(dto, userId) {
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                domain: dto.domain,
                settings: dto.settings || {},
            },
        });
        await this.prisma.auditLog.create({
            data: { tenantId: tenant.id, userId, action: 'TENANT_CREATE', metadata: { name: tenant.name } },
        });
        return tenant;
    }
    async findAll() {
        return this.prisma.tenant.findMany();
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant;
    }
    async update(id, dto, userId) {
        const tenant = await this.findOne(id);
        const updated = await this.prisma.tenant.update({
            where: { id },
            data: { ...dto, settings: dto.settings ? { ...tenant.settings, ...dto.settings } : tenant.settings }
        });
        await this.prisma.auditLog.create({
            data: { tenantId: id, userId, action: 'TENANT_UPDATE', metadata: dto },
        });
        return updated;
    }
    async generateDomainVerificationToken(tenantId, domain) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const tenant = await this.findOne(tenantId);
        const settings = tenant.settings || {};
        settings.domainVerification = { token, expiresAt, domain };
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { settings }
        });
        await this.domainQueue.add('verify', { tenantId, domain, token }, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 }
        });
        return {
            token,
            instructions: {
                dns: `Add TXT record for _lineup-verification.${domain} with value: ${token}`,
                http: `Upload file to https://${domain}/.well-known/lineup-verification.txt with content: ${token}`
            }
        };
    }
    async verifyDomain(tenantId, token) {
        const tenant = await this.findOne(tenantId);
        const settings = tenant.settings || {};
        const verifyConfig = settings.domainVerification;
        if (!verifyConfig || verifyConfig.token !== token) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (new Date() > new Date(verifyConfig.expiresAt)) {
            throw new common_1.BadRequestException('Verification token expired');
        }
        delete settings.domainVerification;
        await this.prisma.$transaction([
            this.prisma.tenant.update({
                where: { id: tenantId },
                data: { domainVerified: true, settings }
            }),
            this.prisma.auditLog.create({
                data: { tenantId, action: 'DOMAIN_VERIFICATION_MANUAL_SUCCESS', metadata: { domain: tenant.domain } }
            })
        ]);
        return { success: true };
    }
    async getTenantsForUser(userId) {
        const userTenants = await this.prisma.userTenant.findMany({
            where: {
                userId,
                status: 'ACTIVE',
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        domain: true,
                        brandingLogoUrl: true,
                        brandingColors: true,
                        trialActive: true,
                        trialEndsAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return userTenants.map(ut => ({
            id: ut.tenant.id,
            name: ut.tenant.name,
            domain: ut.tenant.domain,
            role: ut.role,
            brandingLogoUrl: ut.tenant.brandingLogoUrl,
            brandingColors: ut.tenant.brandingColors,
            trialActive: ut.tenant.trialActive,
            trialEndsAt: ut.tenant.trialEndsAt,
        }));
    }
    async getBranding(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                name: true,
                brandingLogoUrl: true,
                brandingColors: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async updateBranding(tenantId, userId, branding) {
        const tenant = await this.findOne(tenantId);
        const updated = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                brandingLogoUrl: branding.logoUrl !== undefined ? branding.logoUrl : tenant.brandingLogoUrl,
                brandingColors: branding.colors !== undefined ? branding.colors : tenant.brandingColors,
            },
            select: {
                id: true,
                name: true,
                brandingLogoUrl: true,
                brandingColors: true,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'TENANT_BRANDING_UPDATE',
                metadata: branding,
            },
        });
        return updated;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('domain-verification')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map