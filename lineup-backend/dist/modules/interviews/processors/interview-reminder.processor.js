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
var InterviewReminderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewReminderProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const email_service_1 = require("../../email/email.service");
let InterviewReminderProcessor = InterviewReminderProcessor_1 = class InterviewReminderProcessor extends bullmq_1.WorkerHost {
    prisma;
    emailService;
    logger = new common_1.Logger(InterviewReminderProcessor_1.name);
    constructor(prisma, emailService) {
        super();
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async process(job) {
        const { interviewId, tenantId, type } = job.data;
        this.logger.log(`Processing reminder ${type} for interview ${interviewId}`);
        const interview = await this.prisma.interview.findUnique({
            where: { id: interviewId },
            include: { candidate: true, tenant: true },
        });
        if (!interview || interview.status === 'CANCELLED') {
            this.logger.log(`Interview ${interviewId} not found or cancelled. Skipping reminder.`);
            return;
        }
        const interviewers = await this.prisma.user.findMany({
            where: { id: { in: interview.interviewerIds } },
            select: { email: true, name: true }
        });
        const emails = interviewers.map(u => u.email);
        if (interview.candidate.email)
            emails.push(interview.candidate.email);
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                action: 'INTERVIEW_REMINDER_SENT',
                metadata: { interviewId, type, recipients: emails }
            }
        });
        this.logger.log(`Reminders sent to ${emails.join(', ')}`);
    }
};
exports.InterviewReminderProcessor = InterviewReminderProcessor;
exports.InterviewReminderProcessor = InterviewReminderProcessor = InterviewReminderProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('interview-reminder'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InterviewReminderProcessor);
//# sourceMappingURL=interview-reminder.processor.js.map