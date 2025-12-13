import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../../../common/prisma.service';

// Use same redis connection config
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});

export const startBulkImportProcessor = (prisma: PrismaService) => {
    const worker = new Worker('candidates', async job => {
        if (job.name === 'bulk-import') {
            const { tenantId, userId, source, fileKey } = job.data;
            // TODO: Implement CSV / resume parsing logic.
            // For now, log and mark job complete.
            console.log('Bulk import job:', job.id, tenantId, source, fileKey);
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
    }, { connection });

    worker.on('completed', job => console.log('Bulk import completed', job?.id));
    worker.on('failed', (job, err) => console.error('Bulk import failed', job?.id, err));
};
