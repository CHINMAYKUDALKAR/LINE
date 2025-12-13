import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NoShowDetectionProcessor extends WorkerHost {
    private prisma;
    private eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    handleCron(): Promise<void>;
    process(job: Job<{
        interviewId?: string;
    }>): Promise<{
        processed: boolean;
    }>;
    private detectNoShows;
    private checkSingleInterview;
    private markAsNoShow;
}
