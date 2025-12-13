import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { S3Service } from '../../../common/s3.service';
interface ExtractJobData {
    fileId: string;
    tenantId: string;
    s3Key: string;
    mimeType: string;
}
export declare class TextExtractProcessor extends WorkerHost {
    private prisma;
    private s3;
    private readonly logger;
    constructor(prisma: PrismaService, s3: S3Service);
    process(job: Job<ExtractJobData>): Promise<any>;
}
export {};
