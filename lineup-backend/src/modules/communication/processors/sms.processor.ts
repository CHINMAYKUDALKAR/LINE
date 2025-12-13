import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { COMMUNICATION_QUEUES, MessageJobData } from '../queues';
import { MessageStatus } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

@Processor(COMMUNICATION_QUEUES.SMS)
export class SmsProcessor extends WorkerHost {
    private readonly logger = new Logger(SmsProcessor.name);

    constructor(private prisma: PrismaService) {
        super();
    }

    async process(job: Job<MessageJobData>): Promise<void> {
        const { messageLogId, tenantId, recipientPhone, body } = job.data;
        this.logger.log(`Processing SMS job ${job.id} for message ${messageLogId}`);

        if (!recipientPhone) {
            throw new Error('No recipient phone provided');
        }

        try {
            // MOCK: Simulate Twilio SMS API call
            await this.mockSmsSend(recipientPhone, body);

            // Generate mock external ID (Twilio SID format)
            const externalId = `mock-sms-${createId()}`;

            this.logger.log(`SMS sent (mock): ${externalId}`);

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
            this.logger.error(`Failed to send SMS: ${error.message}`);

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
     * Mock SMS send - simulates Twilio API
     * In production, replace with actual Twilio client
     */
    private async mockSmsSend(phone: string, message: string): Promise<void> {
        this.logger.debug(`[MOCK] Sending SMS to ${phone}: ${message.substring(0, 50)}...`);

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 50));

        // Log the mock payload
        console.log('[MOCK Twilio SMS]', {
            to: phone,
            from: process.env.TWILIO_FROM_NUMBER || '+1234567890',
            body: message,
            timestamp: new Date().toISOString(),
        });
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<MessageJobData>, error: Error) {
        this.logger.error(`SMS job ${job.id} failed: ${error.message}`);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<MessageJobData>) {
        this.logger.log(`SMS job ${job.id} completed`);
    }
}
