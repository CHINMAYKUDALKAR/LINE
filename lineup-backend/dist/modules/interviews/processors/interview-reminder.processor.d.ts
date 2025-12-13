import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { EmailService } from '../../email/email.service';
export declare class InterviewReminderProcessor extends WorkerHost {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    process(job: Job<{
        interviewId: string;
        tenantId: string;
        type: string;
    }>): Promise<any>;
}
