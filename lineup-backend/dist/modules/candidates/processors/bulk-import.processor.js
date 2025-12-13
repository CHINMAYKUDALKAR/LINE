"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBulkImportProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const startBulkImportProcessor = (prisma) => {
    const worker = new bullmq_1.Worker('candidates', async (job) => {
        if (job.name === 'bulk-import') {
            const { tenantId, userId, source, fileKey } = job.data;
            console.log('Bulk import job:', job.id, tenantId, source, fileKey);
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
exports.startBulkImportProcessor = startBulkImportProcessor;
//# sourceMappingURL=bulk-import.processor.js.map