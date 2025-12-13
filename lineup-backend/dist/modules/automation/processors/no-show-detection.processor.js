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
var NoShowDetectionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoShowDetectionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../../common/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let NoShowDetectionProcessor = NoShowDetectionProcessor_1 = class NoShowDetectionProcessor extends bullmq_1.WorkerHost {
    prisma;
    eventEmitter;
    logger = new common_1.Logger(NoShowDetectionProcessor_1.name);
    constructor(prisma, eventEmitter) {
        super();
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async handleCron() {
        this.logger.log('Running scheduled no-show detection...');
        await this.detectNoShows();
    }
    async process(job) {
        this.logger.log(`Processing no-show detection job: ${job.id}`);
        if (job.data.interviewId) {
            await this.checkSingleInterview(job.data.interviewId);
        }
        else {
            await this.detectNoShows();
        }
        return { processed: true };
    }
    async detectNoShows() {
        const gracePeriodMinutes = 30;
        const now = new Date();
        const interviews = await this.prisma.interview.findMany({
            where: {
                isNoShow: false,
                hasFeedback: false,
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
                deletedAt: null,
                date: {
                    lte: new Date(now.getTime() - (gracePeriodMinutes * 60 * 1000))
                }
            },
            select: {
                id: true,
                tenantId: true,
                candidateId: true,
                date: true,
                durationMins: true,
                status: true
            }
        });
        this.logger.log(`Found ${interviews.length} potential no-show interviews`);
        let markedCount = 0;
        for (const interview of interviews) {
            const interviewEnd = new Date(interview.date.getTime() + (interview.durationMins * 60 * 1000));
            const checkTime = new Date(interviewEnd.getTime() + (gracePeriodMinutes * 60 * 1000));
            if (now >= checkTime) {
                await this.markAsNoShow(interview);
                markedCount++;
            }
        }
        this.logger.log(`Marked ${markedCount} interviews as no-show`);
    }
    async checkSingleInterview(interviewId) {
        const interview = await this.prisma.interview.findUnique({
            where: { id: interviewId },
            select: {
                id: true,
                tenantId: true,
                candidateId: true,
                date: true,
                durationMins: true,
                status: true,
                isNoShow: true,
                hasFeedback: true
            }
        });
        if (!interview || interview.isNoShow || interview.hasFeedback) {
            return;
        }
        const gracePeriodMinutes = 30;
        const now = new Date();
        const interviewEnd = new Date(interview.date.getTime() + (interview.durationMins * 60 * 1000));
        const checkTime = new Date(interviewEnd.getTime() + (gracePeriodMinutes * 60 * 1000));
        if (now >= checkTime && ['SCHEDULED', 'CONFIRMED'].includes(interview.status)) {
            await this.markAsNoShow(interview);
        }
    }
    async markAsNoShow(interview) {
        await this.prisma.interview.update({
            where: { id: interview.id },
            data: {
                isNoShow: true,
                status: 'NO_SHOW'
            }
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId: interview.tenantId,
                userId: null,
                action: 'INTERVIEW_NO_SHOW_DETECTED',
                metadata: { interviewId: interview.id, candidateId: interview.candidateId }
            }
        });
        this.eventEmitter.emit('interview.no_show', {
            tenantId: interview.tenantId,
            interviewId: interview.id,
            candidateId: interview.candidateId
        });
        this.logger.log(`Marked interview ${interview.id} as no-show`);
    }
};
exports.NoShowDetectionProcessor = NoShowDetectionProcessor;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NoShowDetectionProcessor.prototype, "handleCron", null);
exports.NoShowDetectionProcessor = NoShowDetectionProcessor = NoShowDetectionProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)('no-show-detection'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], NoShowDetectionProcessor);
//# sourceMappingURL=no-show-detection.processor.js.map