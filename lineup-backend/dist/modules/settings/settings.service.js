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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const encryption_util_1 = require("./utils/encryption.util");
const api_key_util_1 = require("./utils/api-key.util");
const nodemailer = __importStar(require("nodemailer"));
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant.settings || {};
    }
    async updateBranding(tenantId, userId, dto) {
        const current = await this.getSettings(tenantId);
        const updated = { ...current, branding: { ...(current['branding'] || {}), ...dto } };
        await this.prisma.$transaction([
            this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: updated } }),
            this.prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'SETTINGS_UPDATE_BRANDING',
                    metadata: dto,
                },
            }),
        ]);
        return updated.branding;
    }
    async updateSso(tenantId, userId, dto) {
        const ssoSettings = { ...dto };
        if (ssoSettings.oauthClientSecret) {
            ssoSettings.oauthClientSecret = (0, encryption_util_1.encrypt)(ssoSettings.oauthClientSecret);
        }
        const current = await this.getSettings(tenantId);
        const updated = { ...current, sso: { ...(current['sso'] || {}), ...ssoSettings } };
        await this.prisma.$transaction([
            this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: updated } }),
            this.prisma.auditLog.create({
                data: { tenantId, userId, action: 'SETTINGS_UPDATE_SSO', metadata: { provider: dto.provider } },
            }),
        ]);
        return updated.sso;
    }
    async updateSmtp(tenantId, userId, dto) {
        const current = await this.getSettings(tenantId);
        const smtpSettings = { ...dto };
        if (smtpSettings.password) {
            smtpSettings.password = (0, encryption_util_1.encrypt)(smtpSettings.password);
        }
        const smtp = current.smtp || {};
        const updated = { ...current, smtp: { ...smtp, ...smtpSettings } };
        await this.prisma.$transaction([
            this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: updated } }),
            this.prisma.auditLog.create({
                data: { tenantId, userId, action: 'SETTINGS_UPDATE_SMTP', metadata: { host: dto.host, user: dto.username } },
            }),
        ]);
        return { success: true };
    }
    async testSmtp(tenantId, dto) {
        const settings = await this.getSettings(tenantId);
        const smtp = settings.smtp;
        if (!smtp)
            throw new common_1.BadRequestException('SMTP not configured');
        let pass = smtp.password;
        try {
            if (pass)
                pass = (0, encryption_util_1.decrypt)(pass);
        }
        catch (e) {
        }
        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: Number(smtp.port),
            secure: smtp.secure === 'true',
            auth: smtp.username ? { user: smtp.username, pass } : undefined,
        });
        try {
            await transporter.sendMail({
                from: smtp.fromAddress || 'noreply@lineup.com',
                to: dto.to,
                subject: 'Lineup SMTP Test',
                text: 'This is a test email to verify your SMTP configuration.',
            });
            await this.prisma.auditLog.create({
                data: { tenantId, action: 'SETTINGS_TEST_SMTP', metadata: { to: dto.to, success: true } }
            });
            return { success: true };
        }
        catch (error) {
            await this.prisma.auditLog.create({
                data: { tenantId, action: 'SETTINGS_TEST_SMTP', metadata: { to: dto.to, success: false, error: error.message } }
            });
            throw new common_1.BadRequestException(`SMTP Test Failed: ${error.message}`);
        }
    }
    async createApiKey(tenantId, userId, dto) {
        const plainKey = (0, api_key_util_1.generateApiKey)();
        const hashedKey = await (0, api_key_util_1.hashApiKey)(plainKey);
        const apiKey = await this.prisma.aPIKey.create({
            data: {
                tenantId,
                name: dto.name,
                hashedKey,
                scopes: dto.scopes,
                active: true,
            },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'API_KEY_CREATE', metadata: { apiKeyId: apiKey.id, scopes: dto.scopes } },
        });
        return { id: apiKey.id, name: apiKey.name, key: plainKey };
    }
    async listApiKeys(tenantId) {
        return this.prisma.aPIKey.findMany({
            where: { tenantId, active: true },
            select: { id: true, name: true, scopes: true, active: true, createdAt: true, lastUsed: true },
        });
    }
    async revokeApiKey(tenantId, userId, id) {
        await this.prisma.aPIKey.updateMany({
            where: { id, tenantId },
            data: { active: false },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'API_KEY_REVOKE', metadata: { apiKeyId: id } },
        });
        return { success: true };
    }
    async getSecurityPolicy(tenantId) {
        return this.prisma.tenantSecurityPolicy.findUnique({ where: { tenantId } }) || {};
    }
    async updateSecurityPolicy(tenantId, userId, dto) {
        const policy = await this.prisma.tenantSecurityPolicy.upsert({
            where: { tenantId },
            update: {
                ...dto,
            },
            create: {
                tenantId,
                ...dto,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'SETTINGS_UPDATE_SECURITY',
                metadata: dto,
            },
        });
        return policy;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map