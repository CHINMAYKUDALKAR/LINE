import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { EmailService } from '../../email/email.service';
export declare class CandidateImportProcessor extends WorkerHost {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    process(job: Job<{
        tenantId: string;
        userId: string;
        url: string;
        mode: string;
    }>): Promise<any>;
}
