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
var SchedulerProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerProcessor = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma.service");
const queues_1 = require("../queues");
const client_1 = require("@prisma/client");
let SchedulerProcessor = SchedulerProcessor_1 = class SchedulerProcessor {
    prisma;
    emailQueue;
    whatsappQueue;
    smsQueue;
    logger = new common_1.Logger(SchedulerProcessor_1.name);
    constructor(prisma, emailQueue, whatsappQueue, smsQueue) {
        this.prisma = prisma;
        this.emailQueue = emailQueue;
        this.whatsappQueue = whatsappQueue;
        this.smsQueue = smsQueue;
    }
    async processDueMessages() {
        const now = new Date();
        this.logger.debug('Checking for due scheduled messages...');
        const dueMessages = await this.prisma.scheduledMessage.findMany({
            where: {
                status: client_1.ScheduleStatus.PENDING,
                scheduledFor: { lte: now },
            },
            take: 100,
        });
        if (dueMessages.length === 0) {
            return;
        }
        this.logger.log(`Found ${dueMessages.length} due scheduled messages`);
        for (const scheduled of dueMessages) {
            try {
                const payload = scheduled.payload;
                const messageLog = await this.prisma.messageLog.create({
                    data: {
                        tenantId: scheduled.tenantId,
                        channel: scheduled.channel,
                        templateId: scheduled.templateId,
                        recipientType: scheduled.recipientType,
                        recipientId: scheduled.recipientId,
                        recipientEmail: payload.recipientEmail,
                        recipientPhone: payload.recipientPhone,
                        subject: payload.subject || '',
                        body: payload.body || '',
                        status: 'QUEUED',
                        scheduledFor: scheduled.scheduledFor,
                    },
                });
                const jobData = {
                    messageLogId: messageLog.id,
                    tenantId: scheduled.tenantId,
                    channel: scheduled.channel,
                    recipientEmail: payload.recipientEmail,
                    recipientPhone: payload.recipientPhone,
                    subject: payload.subject,
                    body: payload.body,
                    templateId: scheduled.templateId || undefined,
                    context: payload.context,
                };
                await this.dispatchToQueue(scheduled.channel, jobData);
                await this.prisma.scheduledMessage.update({
                    where: { id: scheduled.id },
                    data: { status: client_1.ScheduleStatus.SENT },
                });
                this.logger.log(`Dispatched scheduled message ${scheduled.id}`);
            }
            catch (error) {
                this.logger.error(`Failed to process scheduled message ${scheduled.id}: ${error.message}`);
                await this.prisma.scheduledMessage.update({
                    where: { id: scheduled.id },
                    data: { status: client_1.ScheduleStatus.FAILED },
                });
            }
        }
    }
    async dispatchToQueue(channel, jobData) {
        const queue = this.getQueueForChannel(channel);
        await queue.add('send', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    getQueueForChannel(channel) {
        switch (channel) {
            case client_1.Channel.EMAIL:
                return this.emailQueue;
            case client_1.Channel.WHATSAPP:
                return this.whatsappQueue;
            case client_1.Channel.SMS:
                return this.smsQueue;
            default:
                throw new Error(`Unknown channel: ${channel}`);
        }
    }
};
exports.SchedulerProcessor = SchedulerProcessor;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerProcessor.prototype, "processDueMessages", null);
exports.SchedulerProcessor = SchedulerProcessor = SchedulerProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.EMAIL)),
    __param(2, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.WHATSAPP)),
    __param(3, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.SMS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], SchedulerProcessor);
//# sourceMappingURL=scheduler.processor.js.map