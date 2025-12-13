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
var SmsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const queues_1 = require("../queues");
const client_1 = require("@prisma/client");
const cuid2_1 = require("@paralleldrive/cuid2");
let SmsProcessor = SmsProcessor_1 = class SmsProcessor extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(SmsProcessor_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        const { messageLogId, tenantId, recipientPhone, body } = job.data;
        this.logger.log(`Processing SMS job ${job.id} for message ${messageLogId}`);
        if (!recipientPhone) {
            throw new Error('No recipient phone provided');
        }
        try {
            await this.mockSmsSend(recipientPhone, body);
            const externalId = `mock-sms-${(0, cuid2_1.createId)()}`;
            this.logger.log(`SMS sent (mock): ${externalId}`);
            await this.prisma.messageLog.update({
                where: { id: messageLogId },
                data: {
                    status: client_1.MessageStatus.SENT,
                    sentAt: new Date(),
                    externalId: externalId,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send SMS: ${error.message}`);
            await this.prisma.messageLog.update({
                where: { id: messageLogId },
                data: {
                    status: client_1.MessageStatus.FAILED,
                    failedAt: new Date(),
                    retryCount: { increment: 1 },
                    metadata: { error: error.message },
                },
            });
            throw error;
        }
    }
    async mockSmsSend(phone, message) {
        this.logger.debug(`[MOCK] Sending SMS to ${phone}: ${message.substring(0, 50)}...`);
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('[MOCK Twilio SMS]', {
            to: phone,
            from: process.env.TWILIO_FROM_NUMBER || '+1234567890',
            body: message,
            timestamp: new Date().toISOString(),
        });
    }
    onFailed(job, error) {
        this.logger.error(`SMS job ${job.id} failed: ${error.message}`);
    }
    onCompleted(job) {
        this.logger.log(`SMS job ${job.id} completed`);
    }
};
exports.SmsProcessor = SmsProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], SmsProcessor.prototype, "onFailed", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], SmsProcessor.prototype, "onCompleted", null);
exports.SmsProcessor = SmsProcessor = SmsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_1.COMMUNICATION_QUEUES.SMS),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmsProcessor);
//# sourceMappingURL=sms.processor.js.map