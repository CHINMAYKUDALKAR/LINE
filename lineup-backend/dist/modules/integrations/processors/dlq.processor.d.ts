import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { AuditService } from '../../audit/audit.service';
export declare class DlqProcessor extends WorkerHost {
    private prisma;
    private auditService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: AuditService);
    process(job: Job): Promise<any>;
    onFailed(job: Job, error: Error): void;
}
