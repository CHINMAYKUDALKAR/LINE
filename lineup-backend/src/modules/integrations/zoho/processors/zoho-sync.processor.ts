import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaService } from '../../../../common/prisma.service';
import { ZohoSyncService } from '../zoho.sync.service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});

export const startZohoSyncProcessor = (prisma: PrismaService, sync: ZohoSyncService) => {
    const worker = new Worker('zoho-sync', async job => {
        const { tenantId, module } = job.data;

        try {
            if (module === 'leads') return await sync.syncLeads(tenantId);
            if (module === 'contacts') return await sync.syncContacts(tenantId);
        } catch (e) {
            console.error('Zoho sync error', e);
            await prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: { status: 'error' }
            });
            throw e;
        }
    }, { connection });

    worker.on('failed', (job, err) => console.error('Zoho Sync failed', job?.id, err));

    return worker;
};
