"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFeedbackRollupProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const startFeedbackRollupProcessor = (prisma) => {
    const worker = new bullmq_1.Worker('feedback', async (job) => {
        if (job.name === 'rollup-interview') {
            const { tenantId, interviewId } = job.data;
            const agg = await prisma.$queryRaw `
        SELECT avg(rating)::numeric(10,2) as avg_rating, count(*) as cnt
        FROM "Feedback"
        WHERE "tenantId" = ${tenantId} AND "interviewId" = ${interviewId}
      `;
            await prisma.interview.update({
                where: { id: interviewId },
                data: {
                    notes: prisma.$queryRaw `concat(coalesce("notes", ''), ' | agg_rating:', ${agg[0].avg_rating})`
                }
            });
            const current = await prisma.interview.findUnique({ where: { id: interviewId } });
            if (current) {
                const newNote = `${current.notes || ''} | agg_rating:${agg[0].avg_rating}`;
                await prisma.interview.update({
                    where: { id: interviewId },
                    data: { notes: newNote }
                });
            }
        }
    }, { connection });
    return worker;
};
exports.startFeedbackRollupProcessor = startFeedbackRollupProcessor;
//# sourceMappingURL=feedback-rollup.processor.js.map