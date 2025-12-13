import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { MessageJobData } from '../queues';
export declare class SmsProcessor extends WorkerHost {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<MessageJobData>): Promise<void>;
    private mockSmsSend;
    onFailed(job: Job<MessageJobData>, error: Error): void;
    onCompleted(job: Job<MessageJobData>): void;
}
