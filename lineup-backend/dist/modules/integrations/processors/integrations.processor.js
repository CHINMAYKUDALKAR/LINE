"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startIntegrationsProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null
});
const startIntegrationsProcessor = (prisma, factory) => {
    const worker = new bullmq_1.Worker('integrations', async (job) => {
        const { tenantId, provider, action, payload } = job.data;
        const connector = factory.getConnector(provider);
        if (action === 'pull') {
            return await connector.pullChanges(tenantId, payload?.since);
        }
        if (action === 'push') {
            return await connector.pushRecord(tenantId, payload.record);
        }
        if (action === 'webhook') {
            return await connector.handleWebhook(tenantId, payload);
        }
    }, { connection });
    worker.on('failed', async (job, err) => {
        console.error('Integration job failed', job?.id, err);
        if (job?.data) {
            try {
                await prisma.integration.updateMany({
                    where: { tenantId: job.data.tenantId, provider: job.data.provider },
                    data: { status: 'error' }
                });
            }
            catch (dbErr) {
                console.error('Failed to update integration status', dbErr);
            }
        }
    });
    return worker;
};
exports.startIntegrationsProcessor = startIntegrationsProcessor;
//# sourceMappingURL=integrations.processor.js.map