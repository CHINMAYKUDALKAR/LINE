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
var ReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const client_1 = require("@prisma/client");
const cache_util_1 = require("../../common/cache.util");
const scheduled_report_dto_1 = require("./dto/scheduled-report.dto");
let ReportsService = class ReportsService {
    static { ReportsService_1 = this; }
    prisma;
    logger = new common_1.Logger(ReportsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardSummary(tenantId) {
        const [totalCandidates, activeInterviews, offersMade, hires] = await Promise.all([
            this.prisma.candidate.count({
                where: { tenantId, deletedAt: null }
            }),
            this.prisma.interview.count({
                where: {
                    tenantId,
                    deletedAt: null,
                    status: { in: ['SCHEDULED', 'RESCHEDULED', 'PENDING_FEEDBACK'] }
                }
            }),
            this.prisma.candidate.count({
                where: { tenantId, deletedAt: null, stage: 'OFFER' }
            }),
            this.prisma.candidate.count({
                where: { tenantId, deletedAt: null, stage: 'HIRED' }
            })
        ]);
        return {
            totalCandidates,
            activeInterviews,
            offersMade,
            hires
        };
    }
    static VALID_DATE_FIELDS = ['"createdAt"', '"updatedAt"', 'inter.date'];
    buildDateFilter(field, from, to) {
        if (!ReportsService_1.VALID_DATE_FIELDS.includes(field)) {
            throw new common_1.BadRequestException(`Invalid date filter field: ${field}`);
        }
        if (from && to) {
            return client_1.Prisma.sql `AND ${client_1.Prisma.raw(field)} >= ${new Date(from)} AND ${client_1.Prisma.raw(field)} <= ${new Date(to)}`;
        }
        if (from) {
            return client_1.Prisma.sql `AND ${client_1.Prisma.raw(field)} >= ${new Date(from)}`;
        }
        if (to) {
            return client_1.Prisma.sql `AND ${client_1.Prisma.raw(field)} <= ${new Date(to)}`;
        }
        return client_1.Prisma.empty;
    }
    buildRoleFilter(role) {
        return role ? client_1.Prisma.sql `AND "roleTitle" = ${role}` : client_1.Prisma.empty;
    }
    async funnel(tenantId, filters = {}, force = false) {
        this.logger.debug(`funnel called with tenantId=${tenantId}, filters=${JSON.stringify(filters)}, force=${force}`);
        const cacheKey = `reports:${tenantId}:funnel:${JSON.stringify(filters)}`;
        if (!force) {
            const cached = await (0, cache_util_1.getCached)(cacheKey);
            if (cached) {
                this.logger.debug(`funnel returning cached data: ${JSON.stringify(cached)}`);
                return cached;
            }
        }
        const dateFilter = this.buildDateFilter('"createdAt"', filters.from, filters.to);
        const roleFilter = this.buildRoleFilter(filters.role);
        const result = await this.prisma.$queryRaw `
            SELECT
                stage,
                COUNT(*)::int as count,
                ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ())::numeric, 1)::float as percentage
            FROM "Candidate"
            WHERE "tenantId" = ${tenantId} 
            AND "deletedAt" IS NULL
            ${dateFilter}
            ${roleFilter}
            GROUP BY stage
            ORDER BY count DESC;
        `;
        this.logger.debug(`funnel query result: ${JSON.stringify(result)}`);
        await (0, cache_util_1.setCached)(cacheKey, result, 600);
        return result;
    }
    async timeToHire(tenantId, filters = {}, force = false) {
        const cacheKey = `reports:${tenantId}:time_to_hire:${JSON.stringify(filters)}`;
        if (!force) {
            const cached = await (0, cache_util_1.getCached)(cacheKey);
            if (cached)
                return cached;
        }
        const dateFilter = this.buildDateFilter('"createdAt"', filters.from, filters.to);
        const roleFilter = this.buildRoleFilter(filters.role);
        const result = await this.prisma.$queryRaw `
            SELECT
                COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))/86400)::numeric, 1), 0)::float as "averageDays"
            FROM "Candidate"
            WHERE "tenantId" = ${tenantId} 
            AND stage = 'HIRED' 
            AND "deletedAt" IS NULL
            ${dateFilter}
            ${roleFilter}
        `;
        const data = result[0] || { averageDays: 0 };
        await (0, cache_util_1.setCached)(cacheKey, data, 600);
        return data;
    }
    async interviewerLoad(tenantId, filters = {}, force = false) {
        const cacheKey = `reports:${tenantId}:interviewer_load:${JSON.stringify(filters)}`;
        if (!force) {
            const cached = await (0, cache_util_1.getCached)(cacheKey);
            if (cached)
                return cached;
        }
        const dateFilter = this.buildDateFilter('inter.date', filters.from, filters.to);
        const roleFilter = filters.role ? client_1.Prisma.sql `AND c."roleTitle" = ${filters.role}` : client_1.Prisma.empty;
        const result = await this.prisma.$queryRaw `
            SELECT
                u.id as "interviewerId",
                u.name as "interviewerName",
                COUNT(*)::int as "totalInterviews",
                COUNT(CASE WHEN inter.date >= date_trunc('week', current_date) THEN 1 END)::int as "thisWeek",
                COUNT(CASE WHEN inter.date >= date_trunc('month', current_date) THEN 1 END)::int as "thisMonth",
                COUNT(CASE WHEN inter."hasFeedback" = false AND inter.status = 'COMPLETED' THEN 1 END)::int as "pendingFeedback"
            FROM "Interview" inter
            CROSS JOIN LATERAL UNNEST(inter."interviewerIds") AS vid
            JOIN "User" u ON u.id = vid
            JOIN "Candidate" c ON c.id = inter."candidateId"
            WHERE inter."tenantId" = ${tenantId} 
            AND inter."deletedAt" IS NULL 
            AND c."deletedAt" IS NULL
            ${dateFilter}
            ${roleFilter}
            GROUP BY u.id, u.name
            ORDER BY "totalInterviews" DESC;
        `;
        await (0, cache_util_1.setCached)(cacheKey, result, 600);
        return result;
    }
    async sourcePerformance(tenantId, filters = {}, force = false) {
        const cacheKey = `reports:${tenantId}:source_performance:${JSON.stringify(filters)}`;
        if (!force) {
            const cached = await (0, cache_util_1.getCached)(cacheKey);
            if (cached)
                return cached;
        }
        const dateFilter = this.buildDateFilter('"createdAt"', filters.from, filters.to);
        const roleFilter = this.buildRoleFilter(filters.role);
        const result = await this.prisma.$queryRaw `
            SELECT
                COALESCE(source, 'Unknown') as source,
                COUNT(*)::int as "totalCandidates",
                COUNT(CASE WHEN stage = 'HIRED' THEN 1 END)::int as "hires",
                COUNT(CASE WHEN stage IN ('OFFER', 'HIRED') THEN 1 END)::int as "offers"
            FROM "Candidate"
            WHERE "tenantId" = ${tenantId}
            AND "deletedAt" IS NULL
            ${dateFilter}
            ${roleFilter}
            GROUP BY source
            ORDER BY "hires" DESC, "totalCandidates" DESC;
        `;
        await (0, cache_util_1.setCached)(cacheKey, result, 600);
        return result;
    }
    async stageMetrics(tenantId, filters = {}, force = false) {
        return this.funnel(tenantId, filters, force);
    }
    async overview(tenantId, force = false) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const [funnel, timeToHire, interviewerLoad, totalCandidates, activeInterviews, completedThisWeek, pendingFeedback] = await Promise.all([
            this.funnel(tenantId, {}, force),
            this.timeToHire(tenantId, {}, force),
            this.interviewerLoad(tenantId, {}, force),
            this.prisma.candidate.count({
                where: { tenantId, deletedAt: null }
            }),
            this.prisma.interview.count({
                where: {
                    tenantId,
                    deletedAt: null,
                    status: { in: ['SCHEDULED', 'RESCHEDULED'] }
                }
            }),
            this.prisma.interview.count({
                where: {
                    tenantId,
                    deletedAt: null,
                    status: 'COMPLETED',
                    updatedAt: { gte: startOfWeek }
                }
            }),
            this.prisma.interview.count({
                where: {
                    tenantId,
                    deletedAt: null,
                    status: 'PENDING_FEEDBACK'
                }
            })
        ]);
        return {
            funnel,
            timeToHire,
            interviewerLoad,
            totalCandidates,
            activeInterviews,
            completedThisWeek,
            pendingFeedback
        };
    }
    async getReportData(tenantId, reportType, filters = {}, force = true) {
        switch (reportType) {
            case scheduled_report_dto_1.ReportType.OVERVIEW:
                return this.overview(tenantId, force);
            case scheduled_report_dto_1.ReportType.FUNNEL:
                return this.funnel(tenantId, filters, force);
            case scheduled_report_dto_1.ReportType.TIME_TO_HIRE:
                return this.timeToHire(tenantId, filters, force);
            case scheduled_report_dto_1.ReportType.INTERVIEWER_LOAD:
                return this.interviewerLoad(tenantId, filters, force);
            case scheduled_report_dto_1.ReportType.SOURCE_PERFORMANCE:
                return this.sourcePerformance(tenantId, filters, force);
            case scheduled_report_dto_1.ReportType.STAGE_METRICS:
                return this.stageMetrics(tenantId, filters, force);
            default:
                throw new common_1.BadRequestException(`Unknown report type: ${reportType}`);
        }
    }
    async exportToCsv(tenantId, reportType, filters = {}) {
        const data = await this.getReportData(tenantId, reportType, filters);
        const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
        let rows = [];
        if (reportType === scheduled_report_dto_1.ReportType.OVERVIEW && data && typeof data === 'object' && !Array.isArray(data)) {
            const ov = data;
            rows.push({ Metric: 'SUMMARY', Value: '' });
            rows.push({ Metric: 'Total Candidates', Value: ov.totalCandidates || 0 });
            rows.push({ Metric: 'Active Interviews', Value: ov.activeInterviews || 0 });
            rows.push({ Metric: 'Completed This Week', Value: ov.completedThisWeek || 0 });
            rows.push({ Metric: 'Pending Feedback', Value: ov.pendingFeedback || 0 });
            rows.push({ Metric: '', Value: '' });
            rows.push({ Metric: 'FUNNEL', Value: 'Count (Percentage)' });
            (ov.funnel || []).forEach((f) => {
                rows.push({ Metric: f.stage, Value: `${f.count} (${f.percentage || 0}%)` });
            });
            rows.push({ Metric: '', Value: '' });
            rows.push({ Metric: 'TIME TO HIRE', Value: '' });
            rows.push({ Metric: 'Average Days', Value: ov.timeToHire?.averageDays || 0 });
            rows.push({ Metric: '', Value: '' });
            rows.push({ Metric: 'INTERVIEWER LOAD', Value: 'Total Interviews' });
            (ov.interviewerLoad || []).forEach((i) => {
                rows.push({ Metric: i.interviewerName || i.interviewerId, Value: i.totalInterviews });
            });
        }
        else if (Array.isArray(data)) {
            rows = data;
        }
        else if (data && typeof data === 'object') {
            rows = Object.entries(data).map(([key, value]) => ({
                metric: key,
                data: JSON.stringify(value)
            }));
        }
        if (rows.length === 0) {
            return { filename, content: 'No data available' };
        }
        const headers = Object.keys(rows[0]);
        const csvLines = [
            headers.join(','),
            ...rows.map(row => headers.map(h => this.escapeCsvValue(row[h])).join(','))
        ];
        return { filename, content: csvLines.join('\n') };
    }
    async exportToPdf(tenantId, reportType, filters = {}) {
        const data = await this.getReportData(tenantId, reportType, filters);
        const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        const generatedAt = new Date().toLocaleString();
        let tableHtml = '';
        let rows = [];
        if (Array.isArray(data)) {
            rows = data;
        }
        else if (data && typeof data === 'object') {
            rows = Object.entries(data).map(([key, value]) => ({
                metric: key,
                value: Array.isArray(value) ? `${value.length} items` : JSON.stringify(value)
            }));
        }
        if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            tableHtml = `
                <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            ${headers.map(h => `<th style="padding:12px;text-align:left;border-bottom:2px solid #e5e7eb;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${headers.map(h => `<td style="padding:10px;border-bottom:1px solid #e5e7eb;">${row[h] ?? '-'}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${reportType} Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; }
        h1 { color: #0066cc; margin-bottom: 8px; }
        .subtitle { color: #6b7280; margin-bottom: 24px; }
        .meta { font-size: 12px; color: #9ca3af; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${this.formatReportTitle(reportType)} Report</h1>
    <p class="subtitle">Generated for your organization</p>
    <p class="meta">Generated at: ${generatedAt}</p>
    ${tableHtml || '<p>No data available for this report.</p>'}
</body>
</html>
        `.trim();
        return { filename, html };
    }
    escapeCsvValue(value) {
        if (value === null || value === undefined)
            return '';
        let str = String(value);
        if (/^[=@+\-]/.test(str)) {
            str = "'" + str;
        }
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
    formatReportTitle(reportType) {
        return reportType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    async createScheduledReport(tenantId, userId, dto) {
        const nextRunAt = this.calculateNextRun(dto.frequency, dto.time, dto.dayOfWeek, dto.dayOfMonth);
        const scheduled = await this.prisma.scheduledReport.create({
            data: {
                tenantId,
                createdById: userId,
                reportType: dto.reportType,
                frequency: dto.frequency,
                recipients: dto.recipients,
                dayOfWeek: dto.dayOfWeek,
                dayOfMonth: dto.dayOfMonth,
                time: dto.time,
                name: dto.name || `${dto.reportType} - ${dto.frequency}`,
                isActive: true,
                nextRunAt,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'SCHEDULED_REPORT_CREATE',
                metadata: { scheduledReportId: scheduled.id, reportType: dto.reportType },
            },
        });
        return scheduled;
    }
    async listScheduledReports(tenantId) {
        return this.prisma.scheduledReport.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getScheduledReport(tenantId, id) {
        const report = await this.prisma.scheduledReport.findFirst({
            where: { id, tenantId },
        });
        if (!report)
            throw new common_1.NotFoundException('Scheduled report not found');
        return report;
    }
    async deleteScheduledReport(tenantId, userId, id) {
        const report = await this.getScheduledReport(tenantId, id);
        await this.prisma.scheduledReport.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'SCHEDULED_REPORT_DELETE',
                metadata: { scheduledReportId: id, reportType: report.reportType },
            },
        });
        return { success: true };
    }
    async toggleScheduledReport(tenantId, userId, id) {
        const report = await this.getScheduledReport(tenantId, id);
        const updated = await this.prisma.scheduledReport.update({
            where: { id },
            data: { isActive: !report.isActive },
        });
        return updated;
    }
    calculateNextRun(frequency, time, dayOfWeek, dayOfMonth) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const next = new Date();
        next.setHours(hours, minutes, 0, 0);
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }
        switch (frequency) {
            case scheduled_report_dto_1.ScheduleFrequency.DAILY:
                break;
            case scheduled_report_dto_1.ScheduleFrequency.WEEKLY:
                if (dayOfWeek !== undefined) {
                    while (next.getDay() !== dayOfWeek) {
                        next.setDate(next.getDate() + 1);
                    }
                }
                break;
            case scheduled_report_dto_1.ScheduleFrequency.MONTHLY:
                if (dayOfMonth !== undefined) {
                    next.setDate(dayOfMonth);
                    if (next <= now) {
                        next.setMonth(next.getMonth() + 1);
                    }
                }
                break;
        }
        return next;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = ReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map