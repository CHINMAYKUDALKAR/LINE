import { Queue } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
export declare class SchedulerProcessor {
    private prisma;
    private emailQueue;
    private whatsappQueue;
    private smsQueue;
    private readonly logger;
    constructor(prisma: PrismaService, emailQueue: Queue, whatsappQueue: Queue, smsQueue: Queue);
    processDueMessages(): Promise<void>;
    private dispatchToQueue;
    private getQueueForChannel;
}
