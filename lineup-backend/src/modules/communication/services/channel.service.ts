import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ChannelConfigDto, EmailConfigDto, WhatsAppConfigDto, SMSConfigDto } from '../dto';
import { Channel } from '@prisma/client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ChannelService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get all channel configurations for tenant
     */
    async findAll(tenantId: string) {
        const configs = await this.prisma.channelConfig.findMany({
            where: { tenantId },
        });

        // Mask sensitive credentials
        return configs.map(config => ({
            ...config,
            credentials: this.maskCredentials(config.credentials as any),
        }));
    }

    /**
     * Get single channel configuration
     */
    async findOne(tenantId: string, channel: Channel) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel },
        });

        if (!config) {
            throw new NotFoundException(`${channel} configuration not found`);
        }

        return {
            ...config,
            credentials: this.maskCredentials(config.credentials as any),
        };
    }

    /**
     * Get raw config (internal use only - for sending)
     */
    async getConfigForSending(tenantId: string, channel: Channel) {
        return this.prisma.channelConfig.findFirst({
            where: { tenantId, channel, isActive: true },
        });
    }

    /**
     * Create or update channel configuration
     */
    async upsert(tenantId: string, dto: ChannelConfigDto) {
        const provider = this.getProvider(dto);

        // TODO: Encrypt credentials before storing
        const credentials = dto.credentials;

        return this.prisma.channelConfig.upsert({
            where: {
                tenantId_channel: { tenantId, channel: dto.channel },
            },
            update: {
                provider,
                credentials: credentials as any,
                settings: dto.settings,
                isVerified: false, // Reset verification on update
            },
            create: {
                tenantId,
                channel: dto.channel,
                provider,
                credentials: credentials as any,
                settings: dto.settings,
            },
        });
    }

    /**
     * Test channel connection
     */
    async test(tenantId: string, channel: Channel): Promise<{ success: boolean; message: string }> {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel },
        });

        if (!config) {
            throw new NotFoundException(`${channel} configuration not found`);
        }

        try {
            switch (channel) {
                case Channel.EMAIL:
                    return await this.testEmail(config.credentials as any);
                case Channel.WHATSAPP:
                    return await this.testWhatsApp(config.credentials as any);
                case Channel.SMS:
                    return await this.testSms(config.credentials as any);
                default:
                    throw new BadRequestException('Unknown channel type');
            }
        } catch (error) {
            // Update config with failed test
            await this.prisma.channelConfig.update({
                where: { id: config.id },
                data: {
                    isVerified: false,
                    lastTestedAt: new Date(),
                },
            });

            return {
                success: false,
                message: error.message || 'Connection test failed',
            };
        }
    }

    /**
     * Delete channel configuration
     */
    async delete(tenantId: string, channel: Channel) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel },
        });

        if (!config) {
            throw new NotFoundException(`${channel} configuration not found`);
        }

        return this.prisma.channelConfig.delete({ where: { id: config.id } });
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private getProvider(dto: ChannelConfigDto): string {
        switch (dto.channel) {
            case Channel.EMAIL:
                return (dto.credentials as EmailConfigDto).provider || 'smtp';
            case Channel.WHATSAPP:
                return 'whatsapp_cloud';
            case Channel.SMS:
                return (dto.credentials as SMSConfigDto).provider || 'twilio';
            default:
                return 'unknown';
        }
    }

    private maskCredentials(creds: Record<string, any>): Record<string, any> {
        if (!creds) return {};

        const masked: Record<string, any> = {};
        const sensitiveKeys = ['password', 'accessToken', 'authToken', 'apiKey', 'secret'];

        for (const [key, value] of Object.entries(creds)) {
            if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
                masked[key] = value ? '••••••••' : null;
            } else {
                masked[key] = value;
            }
        }

        return masked;
    }

    private async testEmail(creds: EmailConfigDto): Promise<{ success: boolean; message: string }> {
        if (creds.provider === 'ses') {
            // TODO: Implement SES connection test
            return { success: true, message: 'SES configuration looks valid (full test requires sending)' };
        }

        // SMTP test
        if (!creds.host) {
            throw new BadRequestException('SMTP host is required');
        }

        const transporter = nodemailer.createTransport({
            host: creds.host,
            port: creds.port || 587,
            secure: creds.secure || false,
            auth: creds.username ? {
                user: creds.username,
                pass: creds.password,
            } : undefined,
        });

        await transporter.verify();

        // Update config as verified
        return { success: true, message: 'SMTP connection successful' };
    }

    private async testWhatsApp(creds: WhatsAppConfigDto): Promise<{ success: boolean; message: string }> {
        // TODO: Implement WhatsApp API health check
        if (!creds.businessId || !creds.phoneNumberId || !creds.accessToken) {
            throw new BadRequestException('Missing required WhatsApp credentials');
        }

        return { success: true, message: 'WhatsApp credentials configured (sending test required)' };
    }

    private async testSms(creds: SMSConfigDto): Promise<{ success: boolean; message: string }> {
        // TODO: Implement Twilio account verification
        if (!creds.accountSid || !creds.authToken || !creds.fromNumber) {
            throw new BadRequestException('Missing required SMS credentials');
        }

        return { success: true, message: 'SMS credentials configured (sending test required)' };
    }
}
