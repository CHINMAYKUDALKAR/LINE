import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { ReportsService } from '../reports.service';
import { EmailService } from '../../email/email.service';
export declare class ScheduledReportsProcessor extends WorkerHost {
    private prisma;
    private reportsService;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, reportsService: ReportsService, emailService: EmailService);
    process(job: Job): Promise<any>;
    private processReport;
    private calculateNextRun;
}
