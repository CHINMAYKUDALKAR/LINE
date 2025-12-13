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
        const { tenantId, module } = job.data;
        try {
            if (module === 'leads')
                return await sync.syncLeads(tenantId);
            if (module === 'contacts')
                return await sync.syncContacts(tenantId);
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
    return worker;
};
exports.startZohoSyncProcessor = startZohoSyncProcessor;
//# sourceMappingURL=zoho-sync.processor.js.map