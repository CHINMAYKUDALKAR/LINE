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
var InterviewAutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewAutomationService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const queues_1 = require("../../communication/queues");
let InterviewAutomationService = InterviewAutomationService_1 = class InterviewAutomationService {
    automationQueue;
    logger = new common_1.Logger(InterviewAutomationService_1.name);
    constructor(automationQueue) {
        this.automationQueue = automationQueue;
    }
    async onInterviewCreated(payload) {
        await this.publishTrigger('INTERVIEW_SCHEDULED', payload);
        this.logger.log(`Published INTERVIEW_SCHEDULED for interview ${payload.interviewId}`);
        await this.scheduleReminderTriggers(payload);
    }
    async onInterviewRescheduled(payload) {
        await this.publishTrigger('INTERVIEW_RESCHEDULED', payload);
        this.logger.log(`Published INTERVIEW_RESCHEDULED for interview ${payload.interviewId}`);
        await this.scheduleReminderTriggers(payload);
    }
    async onInterviewCancelled(payload) {
        await this.publishTrigger('INTERVIEW_CANCELLED', payload);
        this.logger.log(`Published INTERVIEW_CANCELLED for interview ${payload.interviewId}`);
    }
    async onInterviewCompleted(payload) {
        await this.publishTrigger('INTERVIEW_COMPLETED', payload);
        this.logger.log(`Published INTERVIEW_COMPLETED for interview ${payload.interviewId}`);
    }
    async scheduleReminderTriggers(payload) {
        const interviewTime = new Date(payload.interviewDate).getTime();
        const now = Date.now();
        const remind24h = interviewTime - 24 * 60 * 60 * 1000;
        if (remind24h > now) {
            await this.automationQueue.add('process-trigger', {
                tenantId: payload.tenantId,
                trigger: 'INTERVIEW_REMINDER_24H',
                entityId: payload.interviewId,
                entityType: 'INTERVIEW',
                data: {
                    ...payload,
                    reminderType: '24h',
                },
            }, {
                delay: remind24h - now,
                jobId: `reminder-24h-${payload.interviewId}`,
            });
            this.logger.log(`Scheduled 24h reminder for interview ${payload.interviewId}`);
        }
        const remind1h = interviewTime - 60 * 60 * 1000;
        if (remind1h > now) {
            await this.automationQueue.add('process-trigger', {
                tenantId: payload.tenantId,
                trigger: 'INTERVIEW_REMINDER_1H',
                entityId: payload.interviewId,
                entityType: 'INTERVIEW',
                data: {
                    ...payload,
                    reminderType: '1h',
                },
            }, {
                delay: remind1h - now,
                jobId: `reminder-1h-${payload.interviewId}`,
            });
            this.logger.log(`Scheduled 1h reminder for interview ${payload.interviewId}`);
        }
    }
    async publishTrigger(trigger, payload) {
        const jobData = {
            tenantId: payload.tenantId,
            trigger,
            entityId: payload.interviewId,
            entityType: 'INTERVIEW',
            data: {
                interviewId: payload.interviewId,
                candidateId: payload.candidateId,
                interviewerIds: payload.interviewerIds,
                interviewDate: payload.interviewDate,
                interviewTime: payload.interviewTime,
                duration: payload.duration,
                stage: payload.stage,
                meetingLink: payload.meetingLink,
            },
        };
        await this.automationQueue.add('process-trigger', jobData);
    }
    async runAutomationForInterviewTrigger(trigger, interview) {
        const payload = {
            tenantId: interview.tenantId,
            interviewId: interview.id,
            candidateId: interview.candidateId,
            interviewerIds: interview.interviewerIds,
            interviewDate: interview.date,
            interviewTime: new Date(interview.date).toLocaleTimeString(),
            duration: interview.durationMins,
            stage: interview.stage,
            meetingLink: interview.meetingLink,
        };
        await this.publishTrigger(trigger, payload);
    }
};
exports.InterviewAutomationService = InterviewAutomationService;
exports.InterviewAutomationService = InterviewAutomationService = InterviewAutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(queues_1.COMMUNICATION_QUEUES.AUTOMATION)),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], InterviewAutomationService);
//# sourceMappingURL=interview-automation.service.js.map