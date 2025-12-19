import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { MessageJobData } from '../queues';
import { TwilioService } from '../services/twilio.service';
export declare class SmsProcessor extends WorkerHost {
    private prisma;
    private twilioService;
    private readonly logger;
    constructor(prisma: PrismaService, twilioService: TwilioService);
    process(job: Job<MessageJobData>): Promise<void>;
    onFailed(job: Job<MessageJobData>, error: Error): void;
    onCompleted(job: Job<MessageJobData>): void;
}
