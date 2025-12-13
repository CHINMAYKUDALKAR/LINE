import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { COMMUNICATION_QUEUES, MessageJobData } from '../queues';
import { MessageStatus } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

@Processor(COMMUNICATION_QUEUES.WHATSAPP)
export class WhatsAppProcessor extends WorkerHost {
    private readonly logger = new Logger(WhatsAppProcessor.name);

    constructor(private prisma: PrismaService) {
        super();
    }

    async process(job: Job<MessageJobData>): Promise<void> {
        const { messageLogId, tenantId, recipientPhone, body, context } = job.data;
        this.logger.log(`Processing WhatsApp job ${job.id} for message ${messageLogId}`);

        if (!recipientPhone) {
            throw new Error('No recipient phone provided');
        }

        try {
            // MOCK: Simulate WhatsApp Cloud API call
            await this.mockWhatsAppSend(recipientPhone, body);

            // Generate mock external ID
            const externalId = `mock-wa-${createId()}`;

            this.logger.log(`WhatsApp message sent (mock): ${externalId}`);

            // Update MessageLog status
            await this.prisma.messageLog.update({
                where: { id: messageLogId },
                data: {
                    status: MessageStatus.SENT,
                    sentAt: new Date(),
                    externalId: externalId,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp message: ${error.message}`);

            await this.prisma.messageLog.update({
                where: { id: messageLogId },
                data: {
                    status: MessageStatus.FAILED,
                    failedAt: new Date(),
                    retryCount: { increment: 1 },
                    metadata: { error: error.message },
                },
            });

            throw error;
        }
    }

    /**
     * Mock WhatsApp send - simulates API delay
     * In production, this would call WhatsApp Cloud API
     */
    private async mockWhatsAppSend(phone: string, message: string): Promise<void> {
        this.logger.debug(`[MOCK] Sending WhatsApp to ${phone}: ${message.substring(0, 50)}...`);

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 100));

        // Log the mock payload for debugging
        console.log('[MOCK WhatsApp API]', {
            to: phone,
            type: 'text',
            text: { body: message },
            timestamp: new Date().toISOString(),
        });
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<MessageJobData>, error: Error) {
        this.logger.error(`WhatsApp job ${job.id} failed: ${error.message}`);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<MessageJobData>) {
        this.logger.log(`WhatsApp job ${job.id} completed`);
    }
}
