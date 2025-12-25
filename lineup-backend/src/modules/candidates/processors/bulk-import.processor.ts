import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../../../common/prisma.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('BulkImportProcessor');

// Redis connection - will be closed when worker is stopped
let redisConnection: IORedis | null = null;
let worker: Worker | null = null;

export const startBulkImportProcessor = (prisma: PrismaService) => {
    // Create or reuse connection
    if (!redisConnection) {
        redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null,
        });
    }

    worker = new Worker('candidates', async job => {
        if (job.name === 'bulk-import') {
            const { tenantId, userId, source, fileKey } = job.data;
            // TODO: Implement CSV / resume parsing logic using spreadsheet-parser.util.ts
            logger.log(`Bulk import job: ${job.id} tenantId=${tenantId} source=${source} fileKey=${fileKey}`);

            // Example stub: create one candidate for demonstration
            await prisma.candidate.create({
                data: {
                    tenantId,
                    name: 'Imported Candidate',
                    stage: 'applied',
                    tags: []
                }
            });
        }
    }, { connection: redisConnection });

    worker.on('completed', job => logger.log(`Bulk import completed: ${job?.id}`));
    worker.on('failed', (job, err) => logger.error(`Bulk import failed: ${job?.id}`, err.stack));
};

export const stopBulkImportProcessor = async () => {
    if (worker) {
        await worker.close();
        worker = null;
    }
    if (redisConnection) {
        await redisConnection.quit();
        redisConnection = null;
    }
};
