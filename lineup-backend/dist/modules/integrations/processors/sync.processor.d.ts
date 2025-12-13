import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { ProviderFactory } from '../provider.factory';
import { AuditService } from '../../audit/audit.service';
interface SyncJobData {
    tenantId: string;
    provider: string;
    since?: string;
    triggeredBy?: string;
}
export declare class SyncProcessor extends WorkerHost {
    private prisma;
    private providerFactory;
    private auditService;
    private readonly logger;
    constructor(prisma: PrismaService, providerFactory: ProviderFactory, auditService: AuditService);
    process(job: Job<SyncJobData>): Promise<any>;
}
export {};
