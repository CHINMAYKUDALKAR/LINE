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
var AutomationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const bullmq_3 = require("@nestjs/bullmq");
const bullmq_4 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma.service");
const variable_resolver_service_1 = require("../services/variable-resolver.service");
const queues_1 = require("../queues");
const client_1 = require("@prisma/client");
let AutomationProcessor = AutomationProcessor_1 = class AutomationProcessor extends bullmq_1.WorkerHost {
    prisma;
    variableResolver;
    emailQueue;
    whatsappQueue;
    smsQueue;
    logger = new common_1.Logger(AutomationProcessor_1.name);
    constructor(prisma, variableResolver, emailQueue, whatsappQueue, smsQueue) {
        super();
        this.prisma = prisma;
        this.variableResolver = variableResolver;
        this.emailQueue = emailQueue;
        this.whatsappQueue = whatsappQueue;
        this.smsQueue = smsQueue;
    }
    async process(job) {
        const { tenantId, trigger, entityId, entityType, data } = job.data;
        this.logger.log(`Processing automation trigger: ${trigger} for ${entityType} ${entityId}`);
        const rules = await this.prisma.automationRule.findMany({
            where: {
                tenantId,
                trigger: trigger,
                isActive: true,
            },
            include: { template: true },
        });
        if (rules.length === 0) {
            this.logger.debug(`No active automation rules for trigger ${trigger}`);
            return;
        }
        this.logger.log(`Found ${rules.length} automation rules to execute`);
        let resolvedVars = { ...data };
        if (entityType === 'INTERVIEW') {
            try {
                const vars = await this.variableResolver.resolveForInterview(tenantId, entityId);
                resolvedVars = { ...resolvedVars, ...this.variableResolver.flatten(vars) };
            }
            catch (e) {
                this.logger.warn(`Could not resolve variables for interview ${entityId}: ${e.message}`);
            }
        }
        const recipientInfo = await this.resolveRecipient(tenantId, entityType, entityId, data);
        for (const rule of rules) {
            if (!rule.template)
                continue;
            try {
                const renderedBody = this.renderTemplate(rule.template.body, resolvedVars);
                const renderedSubject = rule.template.subject
                    ? this.renderTemplate(rule.template.subject, resolvedVars)
                    : undefined;
                const scheduledFor = this.calculateScheduledTime(trigger, data, rule.delay);
                if (rule.delay === 0 || scheduledFor <= new Date()) {
                    await this.sendImmediate(tenantId, rule, recipientInfo, renderedSubject, renderedBody, { interviewId: entityId, trigger });
                }
                else {
                    await this.scheduleMessage(tenantId, rule, recipientInfo, renderedSubject, renderedBody, scheduledFor, { interviewId: entityId, trigger });
                }
                this.logger.log(`Processed automation rule ${rule.id} for ${trigger}`);
            }
            catch (error) {
                this.logger.error(`Failed to process automation rule ${rule.id}: ${error.message}`);
            }
        }
    }
    calculateScheduledTime(trigger, data, delay) {
        const interviewDate = data.interviewDate ? new Date(data.interviewDate) : null;
        if (trigger === 'INTERVIEW_REMINDER_24H' && interviewDate) {
            return new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000);
        }
        if (trigger === 'INTERVIEW_REMINDER_1H' && interviewDate) {
            return new Date(interviewDate.getTime() - 60 * 60 * 1000);
        }
        if (delay > 0) {
            return new Date(Date.now() + delay * 60 * 1000);
        }
        return new Date();
    }
    async sendImmediate(tenantId, rule, recipientInfo, subject, body, metadata = {}) {
        const messageLog = await this.prisma.messageLog.create({
            data: {
                tenantId,
                channel: rule.channel,
                templateId: rule.templateId,
                recipientType: recipientInfo.type,
                recipientId: recipientInfo.id,
                recipientEmail: recipientInfo.email,
                recipientPhone: recipientInfo.phone,
                subject: subject || '',
                body,
                status: 'QUEUED',
                metadata: metadata,
            },
        });
        const jobData = {
            messageLogId: messageLog.id,
            tenantId,
            channel: rule.channel,
            recipientEmail: recipientInfo.email,
            recipientPhone: recipientInfo.phone,
            subject,
            body,
            templateId: rule.templateId,
        };
        const queue = this.getQueueForChannel(rule.channel);
        await queue.add('send', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async scheduleMessage(tenantId, rule, recipientInfo, subject, body, scheduledFor, metadata = {}) {
        await this.prisma.scheduledMessage.create({
            data: {
                tenantId,
                channel: rule.channel,
                templateId: rule.templateId,
                recipientType: recipientInfo.type,
                recipientId: recipientInfo.id,
                scheduledFor,
                status: client_1.ScheduleStatus.PENDING,
                payload: {
                    subject,
                    body,
                    recipientEmail: recipientInfo.email,
                    recipientPhone: recipientInfo.phone,
                    ...metadata,
                },
            },
        });
        this.logger.log(`Scheduled message for ${scheduledFor.toISOString()}`);
    }
    async resolveRecipient(tenantId, entityType, entityId, data) {
        if (entityType === 'INTERVIEW') {
            const interview = await this.prisma.interview.findFirst({
                where: { id: entityId, tenantId },
                include: { candidate: true },
            });
            if (interview?.candidate) {
                return {
                    type: 'CANDIDATE',
                    id: interview.candidate.id,
                    email: interview.candidate.email,
                    phone: interview.candidate.phone,
                    name: interview.candidate.name,
                };
            }
        }
        if (entityType === 'CANDIDATE') {
            const candidate = await this.prisma.candidate.findFirst({
                where: { id: entityId, tenantId },
            });
            if (candidate) {
                return {
                    type: 'CANDIDATE',
                    id: candidate.id,
                    email: candidate.email,
                    phone: candidate.phone,
                    name: candidate.name,
                };
            }
        }
        return {
            type: data.recipientType || 'EXTERNAL',
            id: data.recipientId || entityId,
            email: data.recipientEmail,
            phone: data.recipientPhone,
            name: data.recipientName || 'Unknown',
        };
    }
    renderTemplate(template, context) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            const value = trimmedKey.split('.').reduce((obj, k) => obj?.[k], context);
            return value !== undefined ? String(value) : match;
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
    onFailed(job, error) {
        this.logger.error(`Automation job ${job.id} failed: ${error.message}`);
    }
    onCompleted(job) {
        this.logger.log(`Automation job ${job.id} completed`);
    }
};
exports.AutomationProcessor = AutomationProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], AutomationProcessor.prototype, "onFailed", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], AutomationProcessor.prototype, "onCompleted", null);
exports.AutomationProcessor = AutomationProcessor = AutomationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_1.COMMUNICATION_QUEUES.AUTOMATION),
    __param(2, (0, bullmq_3.InjectQueue)(queues_1.COMMUNICATION_QUEUES.EMAIL)),
    __param(3, (0, bullmq_3.InjectQueue)(queues_1.COMMUNICATION_QUEUES.WHATSAPP)),
    __param(4, (0, bullmq_3.InjectQueue)(queues_1.COMMUNICATION_QUEUES.SMS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        variable_resolver_service_1.VariableResolverService,
        bullmq_4.Queue,
        bullmq_4.Queue,
        bullmq_4.Queue])
], AutomationProcessor);
//# sourceMappingURL=automation.processor.js.map