"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReportsProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const startReportsProcessor = (prisma) => {
    const worker = new bullmq_1.Worker('reports', async (job) => {
        if (job.name === 'refresh-materialized') {
            console.log('Refreshing materialized views...');
            await new Promise(r => setTimeout(r, 100));
        }
    }, { connection });
    worker.on('completed', job => console.log('Reports job completed', job?.id));
    worker.on('failed', (job, err) => console.error('Reports job failed', job?.id, err));
};
exports.startReportsProcessor = startReportsProcessor;
//# sourceMappingURL=reports.materialized.processor.js.map