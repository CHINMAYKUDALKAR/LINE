"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const date_fns_1 = require("date-fns");
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});
const interviewsQueue = new bullmq_1.Queue('interviews', { connection });
const startReminderProcessor = (prisma) => {
    const worker = new bullmq_1.Worker('interviews', async (job) => {
        const name = job.name;
        if (name === 'schedule-reminders' || name === 'reschedule-reminders') {
            const { interviewId, tenantId } = job.data;
            const iv = await prisma.interview.findUnique({ where: { id: interviewId } });
            if (!iv || iv.tenantId !== tenantId)
                return;
            const reminders = [
                { minutesBefore: 24 * 60, type: 'reminder.24h' },
                { minutesBefore: 30, type: 'reminder.30m' }
            ];
            for (const r of reminders) {
                const remindAt = (0, date_fns_1.subMinutes)(new Date(iv.date), r.minutesBefore);
                const delay = Math.max(0, remindAt.getTime() - Date.now());
                await interviewsQueue.add('send-reminder', { interviewId, tenantId, type: r.type }, { delay });
            }
        }
        else if (name === 'send-reminder') {
            const { interviewId, tenantId, type } = job.data;
            const iv = await prisma.interview.findUnique({ where: { id: interviewId } });
            if (!iv || iv.tenantId !== tenantId)
                return;
            console.log(`Send ${type} for interview ${interviewId}`);
            await prisma.auditLog.create({ data: { tenantId, userId: 'system', action: 'interview.reminder', metadata: { interviewId, type } } });
        }
        else if (name === 'send-cancel-notifications') {
            const { interviewId } = job.data;
            console.log('Send cancel notifications for', interviewId);
        }
        else if (name === 'bulk-schedule') {
            const { items, tenantId } = job.data;
            for (const it of items) {
                try {
                    await prisma.interview.create({
                        data: {
                            tenantId,
                            candidateId: it.candidateId,
                            interviewerIds: it.interviewerIds,
                            date: new Date(it.date),
                            durationMins: it.durationMins,
                            stage: 'scheduled',
                            status: 'scheduled'
                        }
                    });
                }
                catch (e) {
                    console.error('bulk schedule item failed', e);
                }
            }
        }
    }, { connection });
    worker.on('completed', job => console.log('Interviews job completed', job?.id));
    worker.on('failed', (job, err) => console.error('Interviews job failed', job?.id, err));
};
exports.startReminderProcessor = startReminderProcessor;
//# sourceMappingURL=reminder.processor.js.map