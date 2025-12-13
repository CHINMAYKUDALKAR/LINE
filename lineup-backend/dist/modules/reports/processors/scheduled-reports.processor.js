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
var ScheduledReportsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledReportsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const reports_service_1 = require("../reports.service");
const email_service_1 = require("../../email/email.service");
const scheduled_report_dto_1 = require("../dto/scheduled-report.dto");
let ScheduledReportsProcessor = ScheduledReportsProcessor_1 = class ScheduledReportsProcessor extends bullmq_1.WorkerHost {
    prisma;
    reportsService;
    emailService;
    logger = new common_1.Logger(ScheduledReportsProcessor_1.name);
    constructor(prisma, reportsService, emailService) {
        super();
        this.prisma = prisma;
        this.reportsService = reportsService;
        this.emailService = emailService;
    }
    async process(job) {
        this.logger.log('Processing scheduled reports...');
        const now = new Date();
        const dueReports = await this.prisma.scheduledReport.findMany({
            where: {
                isActive: true,
                nextRunAt: { lte: now },
            },
        });
        this.logger.log(`Found ${dueReports.length} due scheduled reports`);
        for (const report of dueReports) {
            try {
                await this.processReport(report);
            }
            catch (e) {
                this.logger.error(`Failed to process scheduled report ${report.id}: ${e.message}`);
            }
        }
        this.logger.log('Scheduled reports processing completed.');
    }
    async processReport(report) {
        this.logger.debug(`Processing report: ${report.name} (${report.reportType})`);
        const { html } = await this.reportsService.exportToPdf(report.tenantId, report.reportType);
        for (const recipient of report.recipients) {
            try {
                await this.emailService.sendMail(report.tenantId, {
                    to: recipient,
                    template: 'scheduled-report',
                    context: {
                        reportName: report.name || report.reportType,
                        reportHtml: html,
                    },
                });
                this.logger.debug(`Sent report to ${recipient}`);
            }
            catch (e) {
                this.logger.error(`Failed to send report to ${recipient}: ${e.message}`);
            }
        }
        const nextRunAt = this.calculateNextRun(report.frequency, report.time, report.dayOfWeek, report.dayOfMonth);
        await this.prisma.scheduledReport.update({
            where: { id: report.id },
            data: {
                lastRunAt: new Date(),
                nextRunAt,
            },
        });
        this.logger.debug(`Updated next run for ${report.id} to ${nextRunAt}`);
    }
    calculateNextRun(frequency, time, dayOfWeek, dayOfMonth) {
        const [hours, minutes] = time.split(':').map(Number);
        const next = new Date();
        next.setHours(hours, minutes, 0, 0);
        switch (frequency) {
            case scheduled_report_dto_1.ScheduleFrequency.DAILY:
                next.setDate(next.getDate() + 1);
                break;
            case scheduled_report_dto_1.ScheduleFrequency.WEEKLY:
                next.setDate(next.getDate() + 7);
                break;
            case scheduled_report_dto_1.ScheduleFrequency.MONTHLY:
                next.setMonth(next.getMonth() + 1);
                if (dayOfMonth !== undefined && dayOfMonth !== null) {
                    next.setDate(dayOfMonth);
                }
                break;
        }
        return next;
    }
};
exports.ScheduledReportsProcessor = ScheduledReportsProcessor;
exports.ScheduledReportsProcessor = ScheduledReportsProcessor = ScheduledReportsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('scheduled-reports'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        reports_service_1.ReportsService,
        email_service_1.EmailService])
], ScheduledReportsProcessor);
//# sourceMappingURL=scheduled-reports.processor.js.map