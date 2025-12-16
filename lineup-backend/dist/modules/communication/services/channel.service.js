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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const client_1 = require("@prisma/client");
const nodemailer = __importStar(require("nodemailer"));
const crypto_util_1 = require("../../integrations/utils/crypto.util");
let ChannelService = class ChannelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        const configs = await this.prisma.channelConfig.findMany({
            where: { tenantId },
        });
        return configs.map(config => ({
            ...config,
            credentials: this.maskCredentials(config.credentials),
        }));
    }
    async findOne(tenantId, channel) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel },
        });
        if (!config) {
            throw new common_1.NotFoundException(`${channel} configuration not found`);
        }
        return {
            ...config,
            credentials: this.maskCredentials(config.credentials),
        };
    }
    async getConfigForSending(tenantId, channel) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel, isActive: true },
        });
        if (!config)
            return null;
        const rawCreds = config.credentials;
        let decryptedCredentials;
        if (rawCreds?.encrypted) {
            try {
                decryptedCredentials = (0, crypto_util_1.decryptObject)(rawCreds.encrypted);
            }
            catch (error) {
                try {
                    decryptedCredentials = JSON.parse(rawCreds.encrypted);
                }
                catch {
                    console.error('Failed to decrypt credentials for channel:', channel);
                    decryptedCredentials = rawCreds;
                }
            }
        }
        else {
            decryptedCredentials = rawCreds;
        }
        return {
            ...config,
            credentials: decryptedCredentials,
        };
    }
    async upsert(tenantId, dto) {
        const provider = this.getProvider(dto);
        let encryptedCredentials;
        try {
            encryptedCredentials = (0, crypto_util_1.encryptObject)(dto.credentials);
        }
        catch (error) {
            console.warn('Credential encryption failed, storing as plain JSON:', error.message);
            encryptedCredentials = JSON.stringify(dto.credentials);
        }
        return this.prisma.channelConfig.upsert({
            where: {
                tenantId_channel: { tenantId, channel: dto.channel },
            },
            update: {
                provider,
                credentials: { encrypted: encryptedCredentials },
                settings: dto.settings,
                isVerified: false,
            },
            create: {
                tenantId,
                channel: dto.channel,
                provider,
                credentials: { encrypted: encryptedCredentials },
                settings: dto.settings,
            },
        });
    }
    async test(tenantId, channel) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel },
        });
        if (!config) {
            throw new common_1.NotFoundException(`${channel} configuration not found`);
        }
        try {
            switch (channel) {
                case client_1.Channel.EMAIL:
                    return await this.testEmail(config.credentials);
                case client_1.Channel.WHATSAPP:
                    return await this.testWhatsApp(config.credentials);
                case client_1.Channel.SMS:
                    return await this.testSms(config.credentials);
                default:
                    throw new common_1.BadRequestException('Unknown channel type');
            }
        }
        catch (error) {
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
    async delete(tenantId, channel) {
        const config = await this.prisma.channelConfig.findFirst({
            where: { tenantId, channel },
        });
        if (!config) {
            throw new common_1.NotFoundException(`${channel} configuration not found`);
        }
        return this.prisma.channelConfig.delete({ where: { id: config.id } });
    }
    getProvider(dto) {
        switch (dto.channel) {
            case client_1.Channel.EMAIL:
                return dto.credentials.provider || 'smtp';
            case client_1.Channel.WHATSAPP:
                return 'whatsapp_cloud';
            case client_1.Channel.SMS:
                return dto.credentials.provider || 'twilio';
            default:
                return 'unknown';
        }
    }
    maskCredentials(creds) {
        if (!creds)
            return {};
        const masked = {};
        const sensitiveKeys = ['password', 'accessToken', 'authToken', 'apiKey', 'secret'];
        for (const [key, value] of Object.entries(creds)) {
            if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
                masked[key] = value ? '••••••••' : null;
            }
            else {
                masked[key] = value;
            }
        }
        return masked;
    }
    async testEmail(creds) {
        if (creds.provider === 'ses') {
            if (!creds.accessKeyId || !creds.secretAccessKey || !creds.region) {
                throw new common_1.BadRequestException('SES requires accessKeyId, secretAccessKey, and region');
            }
            try {
                const { SESClient, GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
                const sesClient = new SESClient({
                    region: creds.region,
                    credentials: {
                        accessKeyId: creds.accessKeyId,
                        secretAccessKey: creds.secretAccessKey,
                    },
                });
                const result = await sesClient.send(new GetSendQuotaCommand({}));
                return {
                    success: true,
                    message: `SES connected. Daily quota: ${result.Max24HourSend}, Used: ${result.SentLast24Hours}`,
                };
            }
            catch (error) {
                throw new common_1.BadRequestException(`SES connection failed: ${error.message}`);
            }
        }
        if (!creds.host) {
            throw new common_1.BadRequestException('SMTP host is required');
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
        return { success: true, message: 'SMTP connection successful' };
    }
    async testWhatsApp(creds) {
        if (!creds.businessId || !creds.phoneNumberId || !creds.accessToken) {
            throw new common_1.BadRequestException('Missing required WhatsApp credentials');
        }
        try {
            const response = await fetch(`https://graph.facebook.com/v18.0/${creds.phoneNumberId}`, {
                headers: {
                    Authorization: `Bearer ${creds.accessToken}`,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new common_1.BadRequestException(`WhatsApp API error: ${error.error?.message || 'Unknown error'}`);
            }
            const data = await response.json();
            return {
                success: true,
                message: `WhatsApp connected. Phone: ${data.display_phone_number || creds.phoneNumberId}`,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException(`WhatsApp connection failed: ${error.message}`);
        }
    }
    async testSms(creds) {
        if (!creds.accountSid || !creds.authToken || !creds.fromNumber) {
            throw new common_1.BadRequestException('Missing required SMS credentials');
        }
        try {
            const authString = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64');
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}.json`, {
                headers: {
                    Authorization: `Basic ${authString}`,
                },
            });
            if (!response.ok) {
                throw new common_1.BadRequestException('Invalid Twilio credentials');
            }
            const data = await response.json();
            return {
                success: true,
                message: `Twilio connected. Account: ${data.friendly_name}, Status: ${data.status}`,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException(`Twilio connection failed: ${error.message}`);
        }
    }
};
exports.ChannelService = ChannelService;
exports.ChannelService = ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChannelService);
//# sourceMappingURL=channel.service.js.map