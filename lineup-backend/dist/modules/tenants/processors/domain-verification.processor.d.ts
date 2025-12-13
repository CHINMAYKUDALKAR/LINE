import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
export declare class DomainVerificationProcessor extends WorkerHost {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<{
        tenantId: string;
        domain: string;
        token: string;
    }>): Promise<any>;
    private verifySuccess;
}
