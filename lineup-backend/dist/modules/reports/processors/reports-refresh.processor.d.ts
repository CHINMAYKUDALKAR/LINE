import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { ReportsService } from '../reports.service';
export declare class ReportsRefreshProcessor extends WorkerHost {
    private prisma;
    private reportsService;
    private readonly logger;
    constructor(prisma: PrismaService, reportsService: ReportsService);
    process(job: Job): Promise<any>;
}
