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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReceiptController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../../../common/prisma.service");
const client_1 = require("@prisma/client");
let ReceiptController = ReceiptController_1 = class ReceiptController {
    prisma;
    logger = new common_1.Logger(ReceiptController_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleWhatsAppWebhook(payload) {
        this.logger.log('Received WhatsApp webhook');
        if (payload['hub.mode'] === 'subscribe') {
            return payload['hub.challenge'];
        }
        const entry = payload.entry?.[0];
        const changes = entry?.changes?.[0];
        const statuses = changes?.value?.statuses;
        if (statuses) {
            for (const status of statuses) {
                await this.updateMessageStatus({
                    provider: 'whatsapp',
                    externalId: status.id,
                    status: this.mapWhatsAppStatus(status.status),
                    timestamp: status.timestamp,
                });
            }
        }
        return { success: true };
    }
    async handleSesWebhook(payload) {
        this.logger.log('Received SES webhook');
        if (payload.Type === 'SubscriptionConfirmation') {
            this.logger.log('SES subscription confirmation received');
            return { success: true };
        }
        const message = typeof payload.Message === 'string'
            ? JSON.parse(payload.Message)
            : payload.Message;
        if (message?.eventType) {
            const messageId = message.mail?.messageId;
            if (messageId) {
                await this.updateMessageStatus({
                    provider: 'ses',
                    externalId: messageId,
                    status: this.mapSesStatus(message.eventType),
                    timestamp: message.mail?.timestamp,
                    metadata: message,
                });
            }
        }
        return { success: true };
    }
    async handleTwilioWebhook(payload) {
        this.logger.log('Received Twilio webhook');
        const messageSid = payload.MessageSid;
        const messageStatus = payload.MessageStatus;
        if (messageSid && messageStatus) {
            await this.updateMessageStatus({
                provider: 'twilio',
                externalId: messageSid,
                status: this.mapTwilioStatus(messageStatus),
                timestamp: new Date().toISOString(),
            });
        }
        return { success: true };
    }
    async handleMockWebhook(payload) {
        this.logger.log('Received mock webhook', payload);
        await this.updateMessageStatus(payload);
        return { success: true, processed: payload.externalId };
    }
    async updateMessageStatus(data) {
        const { externalId, status, timestamp, metadata } = data;
        const messageLog = await this.prisma.messageLog.findFirst({
            where: { externalId },
        });
        if (!messageLog) {
            this.logger.warn(`MessageLog not found for externalId: ${externalId}`);
            return;
        }
        const updateData = {
            metadata: {
                ...(messageLog.metadata || {}),
                lastWebhook: { status, timestamp, ...metadata },
            },
        };
        switch (status) {
            case 'delivered':
                updateData.status = client_1.MessageStatus.DELIVERED;
                updateData.deliveredAt = new Date(timestamp);
                break;
            case 'read':
                updateData.status = client_1.MessageStatus.READ;
                updateData.readAt = new Date(timestamp);
                break;
            case 'failed':
                updateData.status = client_1.MessageStatus.FAILED;
                updateData.failedAt = new Date(timestamp);
                break;
            case 'bounced':
                updateData.status = client_1.MessageStatus.BOUNCED;
                updateData.failedAt = new Date(timestamp);
                break;
        }
        await this.prisma.messageLog.update({
            where: { id: messageLog.id },
            data: updateData,
        });
        this.logger.log(`Updated MessageLog ${messageLog.id} status to ${status}`);
    }
    mapWhatsAppStatus(status) {
        switch (status) {
            case 'delivered':
                return 'delivered';
            case 'read':
                return 'read';
            case 'failed':
                return 'failed';
            default:
                return 'delivered';
        }
    }
    mapSesStatus(eventType) {
        switch (eventType) {
            case 'Delivery':
                return 'delivered';
            case 'Bounce':
                return 'bounced';
            case 'Complaint':
                return 'failed';
            case 'Reject':
                return 'failed';
            default:
                return 'delivered';
        }
    }
    mapTwilioStatus(status) {
        switch (status) {
            case 'delivered':
                return 'delivered';
            case 'undelivered':
            case 'failed':
                return 'failed';
            default:
                return 'delivered';
        }
    }
};
exports.ReceiptController = ReceiptController;
__decorate([
    (0, common_1.Post)('whatsapp'),
    (0, swagger_1.ApiOperation)({ summary: 'WhatsApp delivery webhook' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "handleWhatsAppWebhook", null);
__decorate([
    (0, common_1.Post)('ses'),
    (0, swagger_1.ApiOperation)({ summary: 'AWS SES delivery webhook' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "handleSesWebhook", null);
__decorate([
    (0, common_1.Post)('twilio'),
    (0, swagger_1.ApiOperation)({ summary: 'Twilio SMS delivery webhook' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "handleTwilioWebhook", null);
__decorate([
    (0, common_1.Post)('mock'),
    (0, swagger_1.ApiOperation)({ summary: 'Mock delivery webhook for testing' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "handleMockWebhook", null);
exports.ReceiptController = ReceiptController = ReceiptController_1 = __decorate([
    (0, swagger_1.ApiTags)('Communication Webhooks'),
    (0, common_1.Controller)('api/v1/webhooks/communication'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceiptController);
//# sourceMappingURL=receipt.controller.js.map