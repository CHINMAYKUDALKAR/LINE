"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startZohoSyncProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const startZohoSyncProcessor = (prisma, sync) => {
    const worker = new bullmq_1.Worker('zoho-sync', async (job) => {
        const { tenantId, module, type } = job.data;
        console.log(`Processing Zoho sync job: tenant=${tenantId}, module=${module}, type=${type}`);
        try {
            if (type === 'full' || module === 'all') {
                return await sync.syncAll(tenantId, module || 'leads');
            }
            if (module === 'stages') {
                return await sync.syncStages(tenantId);
            }
            if (module === 'users') {
                return await sync.syncUsers(tenantId);
            }
            if (module === 'leads') {
                return await sync.syncLeads(tenantId);
            }
            if (module === 'contacts') {
                return await sync.syncContacts(tenantId);
            }
            return await sync.syncAll(tenantId, module || 'leads');
        }
        catch (e) {
            console.error('Zoho sync error', e);
            await prisma.integration.updateMany({
                where: { tenantId, provider: 'zoho' },
                data: { status: 'error' }
            });
            throw e;
        }
    }, { connection });
    worker.on('failed', (job, err) => console.error('Zoho Sync failed', job?.id, err));
    worker.on('completed', (job) => console.log('Zoho Sync completed', job?.id));
    return worker;
};
exports.startZohoSyncProcessor = startZohoSyncProcessor;
//# sourceMappingURL=zoho-sync.processor.js.map