"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopBulkImportProcessor = exports.startBulkImportProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('BulkImportProcessor');
let redisConnection = null;
let worker = null;
const startBulkImportProcessor = (prisma) => {
    if (!redisConnection) {
        redisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null,
        });
    }
    worker = new bullmq_1.Worker('candidates', async (job) => {
        if (job.name === 'bulk-import') {
            const { tenantId, userId, source, fileKey } = job.data;
            logger.log(`Bulk import job: ${job.id} tenantId=${tenantId} source=${source} fileKey=${fileKey}`);
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
exports.startBulkImportProcessor = startBulkImportProcessor;
const stopBulkImportProcessor = async () => {
    if (worker) {
        await worker.close();
        worker = null;
    }
    if (redisConnection) {
        await redisConnection.quit();
        redisConnection = null;
    }
};
exports.stopBulkImportProcessor = stopBulkImportProcessor;
//# sourceMappingURL=bulk-import.processor.js.map