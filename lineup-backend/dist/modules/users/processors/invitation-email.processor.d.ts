import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { EmailService } from '../../email/email.service';
export declare class InvitationEmailProcessor extends WorkerHost {
    private prisma;
    private emailService;
    private logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    process(job: Job): Promise<{
        success: boolean;
    }>;
}
