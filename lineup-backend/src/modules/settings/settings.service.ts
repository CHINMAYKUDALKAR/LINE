import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSsoDto } from './dto/update-sso.dto';
import { UpdateSmtpDto } from './dto/update-smtp.dto';
import { CreateApiKeyDto } from './dto/create-apikey.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
import { encrypt, decrypt } from './utils/encryption.util';
import { generateApiKey, hashApiKey } from './utils/api-key.util';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant.settings || {};
    }

    async updateBranding(tenantId: string, userId: string, dto: UpdateBrandingDto) {
        const current = await this.getSettings(tenantId);
        const updated = { ...(current as any), branding: { ...((current as any)['branding'] || {}), ...dto } };

        await this.prisma.$transaction([
            this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: updated } }),
            this.prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'SETTINGS_UPDATE_BRANDING',
                    metadata: dto as any,
                },
            }),
        ]);
        return updated.branding;
    }

    async updateSso(tenantId: string, userId: string, dto: UpdateSsoDto) {
        const ssoSettings = { ...dto };
        if (ssoSettings.oauthClientSecret) {
            ssoSettings.oauthClientSecret = encrypt(ssoSettings.oauthClientSecret);
        }

        const current = await this.getSettings(tenantId);
        const updated = { ...(current as any), sso: { ...((current as any)['sso'] || {}), ...ssoSettings } };

        await this.prisma.$transaction([
            this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: updated } }),
            this.prisma.auditLog.create({
                data: { tenantId, userId, action: 'SETTINGS_UPDATE_SSO', metadata: { provider: dto.provider } },
            }),
        ]);
        return updated.sso;
    }

    async updateSmtp(tenantId: string, userId: string, dto: UpdateSmtpDto) {
        const current = await this.getSettings(tenantId);
        const smtpSettings = { ...dto };
        if (smtpSettings.password) {
            smtpSettings.password = encrypt(smtpSettings.password);
        }
        const smtp = (current as any).smtp || {};
        const updated = { ...(current as any), smtp: { ...smtp, ...smtpSettings } };

        await this.prisma.$transaction([
            this.prisma.tenant.update({ where: { id: tenantId }, data: { settings: updated as any } }),
            this.prisma.auditLog.create({
                data: { tenantId, userId, action: 'SETTINGS_UPDATE_SMTP', metadata: { host: dto.host, user: dto.username } },
            }),
        ]);
        return { success: true };
    }

    async testSmtp(tenantId: string, dto: TestSmtpDto) {
        const settings: any = await this.getSettings(tenantId);
        const smtp = settings.smtp;
        if (!smtp) throw new BadRequestException('SMTP not configured');

        let pass = smtp.password;
        try {
            if (pass) pass = decrypt(pass);
        } catch (e) {
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
        } catch (error) {
            await this.prisma.auditLog.create({
                data: { tenantId, action: 'SETTINGS_TEST_SMTP', metadata: { to: dto.to, success: false, error: error.message } }
            });
            throw new BadRequestException(`SMTP Test Failed: ${error.message}`);
        }
    }

    async createApiKey(tenantId: string, userId: string, dto: CreateApiKeyDto) {
        const plainKey = generateApiKey();
        const hashedKey = await hashApiKey(plainKey);

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

    async listApiKeys(tenantId: string) {
        return this.prisma.aPIKey.findMany({
            where: { tenantId, active: true },
            select: { id: true, name: true, scopes: true, active: true, createdAt: true, lastUsed: true },
        });
    }

    async revokeApiKey(tenantId: string, userId: string, id: string) {
        await this.prisma.aPIKey.updateMany({
            where: { id, tenantId },
            data: { active: false },
        });

        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'API_KEY_REVOKE', metadata: { apiKeyId: id } },
        });

        return { success: true };
    }

    // ─── Security Policy ────────────────────────────────────────────────────────

    async getSecurityPolicy(tenantId: string) {
        return this.prisma.tenantSecurityPolicy.findUnique({ where: { tenantId } }) || {};
    }

    async updateSecurityPolicy(tenantId: string, userId: string, dto: any) {
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
}
