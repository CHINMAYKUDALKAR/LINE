"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEmailProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null
});
const startEmailProcessor = (prisma, emailService) => {
    const worker = new bullmq_1.Worker('email', async (job) => {
        const { tenantId, to, template, context, attachments } = job.data;
        try {
            const res = await emailService.sendMail(tenantId, {
                to,
                template,
                context,
                attachments
            });
            const auditTenantId = tenantId || 'platform';
            await prisma.auditLog.create({
                data: { tenantId: tenantId, action: 'email.sent', metadata: { to, template, result: res } }
            });
            return res;
        }
        catch (err) {
            console.error('Email job failed', err);
            try {
                await prisma.auditLog.create({
                    data: { tenantId: tenantId, action: 'email.failed', metadata: { to, template, error: String(err) } }
                });
            }
            catch (e) {
                console.error('Failed to log audit failure', e);
            }
            throw err;
        }
    }, { connection });
    worker.on('failed', (job, err) => {
        console.error('Email job failed', job?.id, err);
    });
    return worker;
};
exports.startEmailProcessor = startEmailProcessor;
//# sourceMappingURL=email.processor.js.map