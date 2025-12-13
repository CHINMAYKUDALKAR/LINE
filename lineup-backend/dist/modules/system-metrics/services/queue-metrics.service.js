"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueMetricsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const queues_1 = require("../../communication/queues");
let QueueMetricsService = class QueueMetricsService {
    emailQueue;
    whatsappQueue;
    smsQueue;
    automationQueue;
    schedulerQueue;
    dlqQueue;
    constructor(emailQueue, whatsappQueue, smsQueue, automationQueue, schedulerQueue, dlqQueue) {
        this.emailQueue = emailQueue;
        this.whatsappQueue = whatsappQueue;
        this.smsQueue = smsQueue;
        this.automationQueue = automationQueue;
        this.schedulerQueue = schedulerQueue;
        this.dlqQueue = dlqQueue;
    }
    async getMetrics() {
        const queues = [
            { name: 'email', queue: this.emailQueue },
            { name: 'whatsapp', queue: this.whatsappQueue },
            { name: 'sms', queue: this.smsQueue },
            { name: 'automation', queue: this.automationQueue },
            { name: 'scheduler', queue: this.schedulerQueue },
            { name: 'communication-dlq', queue: this.dlqQueue },
        ];
        const results = await Promise.all(queues.map(async ({ name, queue }) => {
            try {
                const jobCounts = await queue.getJobCounts();
                const now = Date.now();
                const dayAgo = now - 24 * 60 * 60 * 1000;
                const [completedJobs, failedJobs] = await Promise.all([
                    queue.getJobs(['completed'], 0, 1000),
                    queue.getJobs(['failed'], 0, 1000),
                ]);
                const completed24h = completedJobs.filter(job => job.finishedOn && job.finishedOn > dayAgo);
                const failed24h = failedJobs.filter(job => job.finishedOn && job.finishedOn > dayAgo);
                let avgJobDurationMs = 0;
                const durationsWithTiming = completed24h.filter(job => job.processedOn && job.finishedOn);
                if (durationsWithTiming.length > 0) {
                    const totalDuration = durationsWithTiming.reduce((sum, job) => sum + ((job.finishedOn || 0) - (job.processedOn || 0)), 0);
                    avgJobDurationMs = Math.round(totalDuration / durationsWithTiming.length);
                }
                return {
                    queue: name,
                    waiting: jobCounts.waiting || 0,
                    active: jobCounts.active || 0,
                    completed24h: completed24h.length,
                    failed24h: failed24h.length,
                    avgJobDurationMs,
                };
            }
            catch (error) {
                console.error(`Error getting metrics for queue ${name}:`, error);
                return {
                    queue: name,
                    waiting: 0,
                    active: 0,
                    completed24h: 0,
                    failed24h: 0,
                    avgJobDurationMs: 0,
                };
            }
        }));
        return results;
    }
    async getQueueMetrics(queueName) {
        const metrics = await this.getMetrics();
        return metrics.find(m => m.queue === queueName) || null;
    }
};
exports.QueueMetricsService = QueueMetricsService;
exports.QueueMetricsService = QueueMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.EMAIL)),
    __param(1, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.WHATSAPP)),
    __param(2, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.SMS)),
    __param(3, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.AUTOMATION)),
    __param(4, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.SCHEDULER)),
    __param(5, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.DLQ)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], QueueMetricsService);
//# sourceMappingURL=queue-metrics.service.js.map