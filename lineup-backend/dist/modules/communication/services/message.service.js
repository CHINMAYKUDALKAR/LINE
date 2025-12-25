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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma.service");
const queues_1 = require("../queues");
const client_1 = require("@prisma/client");
let MessageService = class MessageService {
    prisma;
    emailQueue;
    whatsappQueue;
    smsQueue;
    constructor(prisma, emailQueue, whatsappQueue, smsQueue) {
        this.prisma = prisma;
        this.emailQueue = emailQueue;
        this.whatsappQueue = whatsappQueue;
        this.smsQueue = smsQueue;
    }
    determineQueue(channel) {
        switch (channel) {
            case client_1.Channel.EMAIL:
                return this.emailQueue;
            case client_1.Channel.WHATSAPP:
                return this.whatsappQueue;
            case client_1.Channel.SMS:
                return this.smsQueue;
            default:
                throw new common_1.BadRequestException(`Unknown channel: ${channel}`);
        }
    }
    async findAll(tenantId, filters) {
        const { channel, status, recipientType, recipientId, fromDate, toDate, search, page = 1, limit: requestedLimit = 20 } = filters;
        const limit = Math.min(requestedLimit, 100);
        const where = { tenantId };
        if (channel)
            where.channel = channel;
        if (status)
            where.status = status;
        if (recipientType)
            where.recipientType = recipientType;
        if (recipientId)
            where.recipientId = recipientId;
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate)
                where.createdAt.gte = fromDate;
            if (toDate)
                where.createdAt.lte = toDate;
        }
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { recipientEmail: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.messageLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.messageLog.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(tenantId, id) {
        const message = await this.prisma.messageLog.findFirst({
            where: { id, tenantId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        return message;
    }
    async send(tenantId, dto, userId) {
        const recipientInfo = await this.resolveRecipient(tenantId, dto.recipientType, dto.recipientId);
        if (dto.channel === client_1.Channel.EMAIL && !recipientInfo.email) {
            throw new common_1.BadRequestException('Recipient has no email address');
        }
        if ((dto.channel === client_1.Channel.WHATSAPP || dto.channel === client_1.Channel.SMS) && !recipientInfo.phone) {
            throw new common_1.BadRequestException('Recipient has no phone number');
        }
        const messageLog = await this.prisma.messageLog.create({
            data: {
                tenantId,
                channel: dto.channel,
                templateId: dto.templateId,
                recipientType: dto.recipientType,
                recipientId: dto.recipientId,
                recipientEmail: recipientInfo.email,
                recipientPhone: recipientInfo.phone,
                subject: dto.subject || '',
                body: dto.body || '',
                status: client_1.MessageStatus.QUEUED,
            },
        });
        const jobData = {
            messageLogId: messageLog.id,
            tenantId,
            channel: dto.channel,
            recipientEmail: recipientInfo.email || undefined,
            recipientPhone: recipientInfo.phone || undefined,
            subject: dto.subject,
            body: dto.body || '',
            templateId: dto.templateId,
            context: dto.context,
        };
        const queue = this.determineQueue(dto.channel);
        await queue.add('send', jobData, {
            attempts: queues_1.QUEUE_RETRY_CONFIG.attempts,
            backoff: queues_1.QUEUE_RETRY_CONFIG.backoff,
        });
        return messageLog;
    }
    async schedule(tenantId, dto, userId) {
        const now = Date.now();
        const rateLimitKey = `schedule:${tenantId}`;
        const limit = this.retryRateLimits.get(rateLimitKey);
        if (limit && limit.resetAt > now) {
            if (limit.count >= 20) {
                throw new common_1.BadRequestException('Rate limit exceeded: max 20 scheduled messages per hour');
            }
            limit.count++;
        }
        else {
            this.retryRateLimits.set(rateLimitKey, { count: 1, resetAt: now + 3600000 });
        }
        const recipientInfo = await this.resolveRecipient(tenantId, dto.recipientType, dto.recipientId);
        const scheduled = await this.prisma.scheduledMessage.create({
            data: {
                tenantId,
                channel: dto.channel,
                templateId: dto.templateId,
                recipientType: dto.recipientType,
                recipientId: dto.recipientId,
                scheduledFor: dto.scheduledFor,
                status: client_1.ScheduleStatus.PENDING,
                payload: {
                    subject: dto.subject,
                    body: dto.body,
                    context: dto.context,
                    recipientEmail: recipientInfo.email,
                    recipientPhone: recipientInfo.phone,
                },
                createdById: userId,
            },
        });
        return scheduled;
    }
    async cancelScheduled(tenantId, id) {
        const scheduled = await this.prisma.scheduledMessage.findFirst({
            where: { id, tenantId, status: client_1.ScheduleStatus.PENDING },
        });
        if (!scheduled) {
            throw new common_1.NotFoundException('Scheduled message not found or already processed');
        }
        return this.prisma.scheduledMessage.update({
            where: { id },
            data: { status: client_1.ScheduleStatus.CANCELLED },
        });
    }
    retryRateLimits = new Map();
    RETRY_LIMIT_PER_MESSAGE = 5;
    RETRY_LIMIT_PER_TENANT = 50;
    RETRY_WINDOW_MS = 60 * 60 * 1000;
    checkRetryRateLimit(tenantId, messageId) {
        const now = Date.now();
        if (Math.random() < 0.1) {
            for (const [key, value] of this.retryRateLimits) {
                if (now > value.resetAt) {
                    this.retryRateLimits.delete(key);
                }
            }
        }
        const messageKey = `msg:${tenantId}:${messageId}`;
        const messageLimit = this.retryRateLimits.get(messageKey);
        if (messageLimit && now < messageLimit.resetAt) {
            if (messageLimit.count >= this.RETRY_LIMIT_PER_MESSAGE) {
                return { limited: true, reason: `Message retry limit exceeded (max ${this.RETRY_LIMIT_PER_MESSAGE}/hour)` };
            }
            messageLimit.count++;
        }
        else {
            this.retryRateLimits.set(messageKey, { count: 1, resetAt: now + this.RETRY_WINDOW_MS });
        }
        const tenantKey = `tenant:${tenantId}`;
        const tenantLimit = this.retryRateLimits.get(tenantKey);
        if (tenantLimit && now < tenantLimit.resetAt) {
            if (tenantLimit.count >= this.RETRY_LIMIT_PER_TENANT) {
                return { limited: true, reason: `Tenant retry limit exceeded (max ${this.RETRY_LIMIT_PER_TENANT}/hour)` };
            }
            tenantLimit.count++;
        }
        else {
            this.retryRateLimits.set(tenantKey, { count: 1, resetAt: now + this.RETRY_WINDOW_MS });
        }
        return { limited: false };
    }
    async retry(tenantId, id) {
        const rateLimitCheck = this.checkRetryRateLimit(tenantId, id);
        if (rateLimitCheck.limited) {
            throw new common_1.BadRequestException(rateLimitCheck.reason);
        }
        const message = await this.prisma.messageLog.findFirst({
            where: { id, tenantId, status: client_1.MessageStatus.FAILED },
        });
        if (!message) {
            throw new common_1.NotFoundException('Failed message not found');
        }
        if (message.retryCount >= 10) {
            throw new common_1.BadRequestException('Maximum retry attempts (10) reached for this message');
        }
        await this.prisma.messageLog.update({
            where: { id },
            data: {
                status: client_1.MessageStatus.QUEUED,
                retryCount: { increment: 1 },
                failedAt: null,
            },
        });
        const jobData = {
            messageLogId: message.id,
            tenantId,
            channel: message.channel,
            recipientEmail: message.recipientEmail || undefined,
            recipientPhone: message.recipientPhone || undefined,
            subject: message.subject || undefined,
            body: message.body,
            templateId: message.templateId || undefined,
        };
        const queue = this.determineQueue(message.channel);
        await queue.add('send', jobData, {
            attempts: queues_1.QUEUE_RETRY_CONFIG.attempts,
            backoff: queues_1.QUEUE_RETRY_CONFIG.backoff,
        });
        return { success: true, messageId: message.id };
    }
    async getStats(tenantId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [statusCounts, channelCounts, scheduledCount, recentActivity] = await Promise.all([
            this.prisma.messageLog.groupBy({
                by: ['status'],
                where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
                _count: true,
            }),
            this.prisma.messageLog.groupBy({
                by: ['channel'],
                where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
                _count: true,
            }),
            this.prisma.scheduledMessage.count({
                where: { tenantId, status: client_1.ScheduleStatus.PENDING },
            }),
            this.prisma.messageLog.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    channel: true,
                    status: true,
                    recipientEmail: true,
                    subject: true,
                    createdAt: true,
                },
            }),
        ]);
        const statusMap = Object.fromEntries(statusCounts.map(s => [s.status, s._count]));
        const channelMap = Object.fromEntries(channelCounts.map(c => [c.channel.toLowerCase(), c._count]));
        return {
            totalSent: (statusMap[client_1.MessageStatus.SENT] || 0) + (statusMap[client_1.MessageStatus.DELIVERED] || 0),
            totalPending: (statusMap[client_1.MessageStatus.PENDING] || 0) + (statusMap[client_1.MessageStatus.QUEUED] || 0),
            totalFailed: (statusMap[client_1.MessageStatus.FAILED] || 0) + (statusMap[client_1.MessageStatus.BOUNCED] || 0),
            totalScheduled: scheduledCount,
            byChannel: {
                email: channelMap.email || 0,
                whatsapp: channelMap.whatsapp || 0,
                sms: channelMap.sms || 0,
            },
            recentActivity,
        };
    }
    async resolveRecipient(tenantId, type, id) {
        switch (type) {
            case client_1.RecipientType.CANDIDATE:
                const candidate = await this.prisma.candidate.findFirst({
                    where: { id, tenantId, deletedAt: null },
                });
                if (!candidate)
                    throw new common_1.BadRequestException('Candidate not found');
                return { email: candidate.email, phone: candidate.phone, name: candidate.name };
            case client_1.RecipientType.INTERVIEWER:
            case client_1.RecipientType.USER:
                const userTenant = await this.prisma.userTenant.findFirst({
                    where: {
                        userId: id,
                        tenantId,
                        status: 'ACTIVE',
                    },
                    include: {
                        user: {
                            select: { email: true, name: true },
                        },
                    },
                });
                if (!userTenant || !userTenant.user) {
                    throw new common_1.BadRequestException('User not found or not active in tenant');
                }
                return { email: userTenant.user.email, phone: null, name: userTenant.user.name };
            case client_1.RecipientType.EXTERNAL:
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^\+?[1-9]\d{6,14}$/;
                const isEmail = emailRegex.test(id);
                const isPhone = phoneRegex.test(id);
                if (!isEmail && !isPhone) {
                    throw new common_1.BadRequestException('External recipient must be a valid email or phone number');
                }
                return { email: isEmail ? id : null, phone: isPhone ? id : null, name: 'External' };
            default:
                throw new common_1.BadRequestException('Invalid recipient type');
        }
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.EMAIL)),
    __param(2, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.WHATSAPP)),
    __param(3, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.SMS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], MessageService);
//# sourceMappingURL=message.service.js.map