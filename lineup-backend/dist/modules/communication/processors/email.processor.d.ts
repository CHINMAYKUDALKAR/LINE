import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { MessageJobData } from '../queues';
export declare class EmailProcessor extends WorkerHost {
    private prisma;
    private readonly logger;
    private transporter;
    constructor(prisma: PrismaService);
    process(job: Job<MessageJobData>): Promise<void>;
    onFailed(job: Job<MessageJobData>, error: Error): void;
    onCompleted(job: Job<MessageJobData>): void;
}
