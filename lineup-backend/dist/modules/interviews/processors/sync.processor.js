"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSyncProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const startSyncProcessor = () => {
    const worker = new bullmq_1.Worker('interviews', async (job) => {
        if (job.name === 'calendar-sync') {
            const { interviewId } = job.data;
            console.log('Calendar sync for interview', interviewId);
        }
    }, { connection });
    worker.on('completed', job => console.log('Sync job completed', job?.id));
    worker.on('failed', (job, err) => console.error('Sync job failed', job?.id, err));
};
exports.startSyncProcessor = startSyncProcessor;
//# sourceMappingURL=sync.processor.js.map