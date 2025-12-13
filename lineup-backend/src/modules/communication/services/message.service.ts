import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { SendMessageDto, ScheduleMessageDto, MessageFilterDto } from '../dto';
import { COMMUNICATION_QUEUES, MessageJobData, QUEUE_RETRY_CONFIG } from '../queues';
import { Channel, MessageStatus, RecipientType, ScheduleStatus } from '@prisma/client';

@Injectable()
export class MessageService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue(COMMUNICATION_QUEUES.EMAIL) private emailQueue: Queue,
        @InjectQueue(COMMUNICATION_QUEUES.WHATSAPP) private whatsappQueue: Queue,
        @InjectQueue(COMMUNICATION_QUEUES.SMS) private smsQueue: Queue,
    ) { }

    /**
     * Determine which queue to use based on channel
     */
    private determineQueue(channel: Channel): Queue {
        switch (channel) {
            case Channel.EMAIL:
                return this.emailQueue;
            case Channel.WHATSAPP:
                return this.whatsappQueue;
            case Channel.SMS:
                return this.smsQueue;
            default:
                throw new BadRequestException(`Unknown channel: ${channel}`);
        }
    }

    /**
     * Get paginated message logs with filters
     */
    async findAll(tenantId: string, filters: MessageFilterDto) {
        const { channel, status, recipientType, recipientId, fromDate, toDate, search, page = 1, limit = 20 } = filters;

        const where: any = { tenantId };

        if (channel) where.channel = channel;
        if (status) where.status = status;
        if (recipientType) where.recipientType = recipientType;
        if (recipientId) where.recipientId = recipientId;

        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate) where.createdAt.gte = fromDate;
            if (toDate) where.createdAt.lte = toDate;
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

    /**
     * Get single message by ID
     */
    async findOne(tenantId: string, id: string) {
        const message = await this.prisma.messageLog.findFirst({
            where: { id, tenantId },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        return message;
    }

    /**
     * Send immediate message - creates log entry and dispatches to queue
     */
    async send(tenantId: string, dto: SendMessageDto, userId?: string) {
        // Resolve recipient details
        const recipientInfo = await this.resolveRecipient(tenantId, dto.recipientType, dto.recipientId);

        // Validate channel-specific requirements
        if (dto.channel === Channel.EMAIL && !recipientInfo.email) {
            throw new BadRequestException('Recipient has no email address');
        }
        if ((dto.channel === Channel.WHATSAPP || dto.channel === Channel.SMS) && !recipientInfo.phone) {
            throw new BadRequestException('Recipient has no phone number');
        }

        // Create message log entry
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
                status: MessageStatus.QUEUED,
            },
        });

        // Create job data
        const jobData: MessageJobData = {
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

        // Dispatch to appropriate queue
        const queue = this.determineQueue(dto.channel);
        await queue.add('send', jobData, {
            attempts: QUEUE_RETRY_CONFIG.attempts,
            backoff: QUEUE_RETRY_CONFIG.backoff,
        });

        return messageLog;
    }

    /**
     * Schedule a future message
     */
    async schedule(tenantId: string, dto: ScheduleMessageDto, userId?: string) {
        const recipientInfo = await this.resolveRecipient(tenantId, dto.recipientType, dto.recipientId);

        const scheduled = await this.prisma.scheduledMessage.create({
            data: {
                tenantId,
                channel: dto.channel,
                templateId: dto.templateId,
                recipientType: dto.recipientType,
                recipientId: dto.recipientId,
                scheduledFor: dto.scheduledFor,
                status: ScheduleStatus.PENDING,
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

    /**
     * Cancel a scheduled message
     */
    async cancelScheduled(tenantId: string, id: string) {
        const scheduled = await this.prisma.scheduledMessage.findFirst({
            where: { id, tenantId, status: ScheduleStatus.PENDING },
        });

        if (!scheduled) {
            throw new NotFoundException('Scheduled message not found or already processed');
        }

        return this.prisma.scheduledMessage.update({
            where: { id },
            data: { status: ScheduleStatus.CANCELLED },
        });
    }

    /**
     * Retry a failed message - resets status and pushes to queue
     */
    async retry(tenantId: string, id: string) {
        const message = await this.prisma.messageLog.findFirst({
            where: { id, tenantId, status: MessageStatus.FAILED },
        });

        if (!message) {
            throw new NotFoundException('Failed message not found');
        }

        // Reset status to QUEUED
        await this.prisma.messageLog.update({
            where: { id },
            data: {
                status: MessageStatus.QUEUED,
                retryCount: { increment: 1 },
                failedAt: null,
            },
        });

        // Create fresh job data
        const jobData: MessageJobData = {
            messageLogId: message.id,
            tenantId,
            channel: message.channel,
            recipientEmail: message.recipientEmail || undefined,
            recipientPhone: message.recipientPhone || undefined,
            subject: message.subject || undefined,
            body: message.body,
            templateId: message.templateId || undefined,
        };

        // Push to queue
        const queue = this.determineQueue(message.channel);
        await queue.add('send', jobData, {
            attempts: QUEUE_RETRY_CONFIG.attempts,
            backoff: QUEUE_RETRY_CONFIG.backoff,
        });

        return { success: true, messageId: message.id };
    }

    /**
     * Get communication stats for dashboard
     */
    async getStats(tenantId: string) {
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
                where: { tenantId, status: ScheduleStatus.PENDING },
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

        const statusMap = Object.fromEntries(
            statusCounts.map(s => [s.status, s._count])
        );
        const channelMap = Object.fromEntries(
            channelCounts.map(c => [c.channel.toLowerCase(), c._count])
        );

        return {
            totalSent: (statusMap[MessageStatus.SENT] || 0) + (statusMap[MessageStatus.DELIVERED] || 0),
            totalPending: (statusMap[MessageStatus.PENDING] || 0) + (statusMap[MessageStatus.QUEUED] || 0),
            totalFailed: (statusMap[MessageStatus.FAILED] || 0) + (statusMap[MessageStatus.BOUNCED] || 0),
            totalScheduled: scheduledCount,
            byChannel: {
                email: channelMap.email || 0,
                whatsapp: channelMap.whatsapp || 0,
                sms: channelMap.sms || 0,
            },
            recentActivity,
        };
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private async resolveRecipient(tenantId: string, type: RecipientType, id: string) {
        switch (type) {
            case RecipientType.CANDIDATE:
                const candidate = await this.prisma.candidate.findFirst({
                    where: { id, tenantId },
                });
                if (!candidate) throw new BadRequestException('Candidate not found');
                return { email: candidate.email, phone: candidate.phone, name: candidate.name };

            case RecipientType.INTERVIEWER:
            case RecipientType.USER:
                const user = await this.prisma.user.findFirst({
                    where: { id, tenantId },
                });
                if (!user) throw new BadRequestException('User not found');
                return { email: user.email, phone: null, name: user.name };

            case RecipientType.EXTERNAL:
                // For external, the ID should be the email/phone
                return { email: id, phone: id, name: 'External' };

            default:
                throw new BadRequestException('Invalid recipient type');
        }
    }
}
