import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { MessageJobData } from '../queues';
import { WhatsAppService } from '../services/whatsapp.service';
export declare class WhatsAppProcessor extends WorkerHost {
    private prisma;
    private whatsAppService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsAppService: WhatsAppService);
    process(job: Job<MessageJobData>): Promise<void>;
    onFailed(job: Job<MessageJobData>, error: Error): void;
    onCompleted(job: Job<MessageJobData>): void;
}
