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
var RetryProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const bullmq_3 = require("@nestjs/bullmq");
let RetryProcessor = RetryProcessor_1 = class RetryProcessor extends bullmq_1.WorkerHost {
    syncQueue;
    logger = new common_1.Logger(RetryProcessor_1.name);
    constructor(syncQueue) {
        super();
        this.syncQueue = syncQueue;
    }
    async process(job) {
        this.logger.log(`Retrying job ${job.id} from DLQ`);
        try {
            await this.syncQueue.add('sync', job.data, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });
            this.logger.log(`Job ${job.id} moved back to sync queue`);
            return { success: true, retried: true };
        }
        catch (error) {
            this.logger.error(`Failed to retry job ${job.id}`, error);
            throw error;
        }
    }
    async retryAll() {
        const dlqJobs = await this.syncQueue.getFailed();
        this.logger.log(`Found ${dlqJobs.length} failed jobs to retry`);
        for (const job of dlqJobs) {
            try {
                await this.process(job);
            }
            catch (error) {
                this.logger.error(`Failed to process DLQ job ${job.id}`, error);
            }
        }
    }
};
exports.RetryProcessor = RetryProcessor;
exports.RetryProcessor = RetryProcessor = RetryProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('integration-dlq'),
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_3.InjectQueue)('integration-sync')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], RetryProcessor);
//# sourceMappingURL=retry.processor.js.map