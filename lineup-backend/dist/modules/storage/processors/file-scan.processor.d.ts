import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { S3Service } from '../../../common/s3.service';
interface ScanJobData {
    fileId: string;
    tenantId: string;
    s3Key: string;
}
export declare class FileScanProcessor extends WorkerHost {
    private prisma;
    private s3;
    private readonly logger;
    constructor(prisma: PrismaService, s3: S3Service);
    process(job: Job<ScanJobData>): Promise<any>;
    private scanFile;
}
export {};
