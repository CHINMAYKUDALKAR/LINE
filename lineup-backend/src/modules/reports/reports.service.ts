import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { loadSQL } from '../../common/sql.util';
import { getCached, setCached } from '../../common/cache.util';
import { CreateScheduledReportDto, ReportType, ScheduleFrequency } from './dto/scheduled-report.dto';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(private prisma: PrismaService) { }

    // ─── Core Report Methods ─────────────────────────────────────────────────────

    async getReport(tenantId: string, name: string, forceRefresh = false) {
        const cacheKey = `reports:${tenantId}:${name}`;

        if (!forceRefresh) {
            const cached = await getCached(cacheKey);
            if (cached) return cached;
        }

        try {
            const sql = loadSQL(`${name}.sql`);
            const result = await this.prisma.$queryRawUnsafe(sql, tenantId);

            // Cache for 30 minutes
            await setCached(cacheKey, result, 1800);
            return result;
        } catch (error) {
            this.logger.error(`Error generating report ${name}: ${error.message}`);
            throw error;
        }
    }

    async funnel(tenantId: string, force = false) { return this.getReport(tenantId, 'funnel', force); }
    async timeToHire(tenantId: string, force = false) {
        const result = await this.getReport(tenantId, 'time_to_hire', force) as any[];
        return result[0] || { averageDays: 0 };
    }
    async interviewerLoad(tenantId: string, force = false) { return this.getReport(tenantId, 'interviewer_load', force); }
    async sourcePerformance(tenantId: string, force = false) { return this.getReport(tenantId, 'source_performance', force); }
    async stageMetrics(tenantId: string, force = false) { return this.getReport(tenantId, 'stage_metrics', force); }

    async overview(tenantId: string, force = false) {
        const [funnel, timeToHire, interviewerLoad] = await Promise.all([
            this.funnel(tenantId, force),
            this.timeToHire(tenantId, force),
            this.interviewerLoad(tenantId, force)
        ]);
        return { funnel, timeToHire, interviewerLoad };
    }

    // ─── Export Methods ──────────────────────────────────────────────────────────

    async getReportData(tenantId: string, reportType: ReportType, force = true) {
        switch (reportType) {
            case ReportType.OVERVIEW:
                return this.overview(tenantId, force);
            case ReportType.FUNNEL:
                return this.funnel(tenantId, force);
            case ReportType.TIME_TO_HIRE:
                return this.timeToHire(tenantId, force);
            case ReportType.INTERVIEWER_LOAD:
                return this.interviewerLoad(tenantId, force);
            case ReportType.SOURCE_PERFORMANCE:
                return this.sourcePerformance(tenantId, force);
            case ReportType.STAGE_METRICS:
                return this.stageMetrics(tenantId, force);
            default:
                throw new BadRequestException(`Unknown report type: ${reportType}`);
        }
    }

    async exportToCsv(tenantId: string, reportType: ReportType): Promise<{ filename: string; content: string }> {
        const data = await this.getReportData(tenantId, reportType);
        const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;

        // Handle different report structures
        let rows: any[] = [];

        if (reportType === ReportType.OVERVIEW && data && typeof data === 'object' && !Array.isArray(data)) {
            const ov = data as any;
            // Add Summary section
            rows.push({ Metric: 'SUMMARY', Value: '' });
            rows.push({ Metric: 'Total Candidates', Value: ov.totalCandidates || 0 });
            rows.push({ Metric: 'Active Interviews', Value: ov.activeInterviews || 0 });
            rows.push({ Metric: 'Completed This Week', Value: ov.completedThisWeek || 0 });
            rows.push({ Metric: 'Pending Feedback', Value: ov.pendingFeedback || 0 });

            // Add Funnel section
            rows.push({ Metric: '', Value: '' });
            rows.push({ Metric: 'FUNNEL', Value: 'Count (Percentage)' });
            (ov.funnel || []).forEach((f: any) => {
                rows.push({ Metric: f.stage, Value: `${f.count} (${f.percentage || 0}%)` });
            });

            // Add Time to Hire section
            rows.push({ Metric: '', Value: '' });
            rows.push({ Metric: 'TIME TO HIRE', Value: '' });
            rows.push({ Metric: 'Average Days', Value: ov.timeToHire?.averageDays || 0 });

            // Add Interviewer Load section
            rows.push({ Metric: '', Value: '' });
            rows.push({ Metric: 'INTERVIEWER LOAD', Value: 'Total Interviews' });
            (ov.interviewerLoad || []).forEach((i: any) => {
                rows.push({ Metric: i.interviewerName || i.interviewerId, Value: i.totalInterviews });
            });
        }
        else if (Array.isArray(data)) {
            rows = data;
        } else if (data && typeof data === 'object') {
            // For other objects
            rows = Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
                metric: key,
                data: JSON.stringify(value)
            }));
        }

        if (rows.length === 0) {
            return { filename, content: 'No data available' };
        }

        // Generate CSV
        const headers = Object.keys(rows[0]);
        const csvLines = [
            headers.join(','),
            ...rows.map(row => headers.map(h => this.escapeCsvValue(row[h])).join(','))
        ];

        return { filename, content: csvLines.join('\n') };
    }

    async exportToPdf(tenantId: string, reportType: ReportType): Promise<{ filename: string; html: string }> {
        const data = await this.getReportData(tenantId, reportType);
        const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        const generatedAt = new Date().toLocaleString();

        // Generate HTML that can be converted to PDF on client or via a PDF service
        let tableHtml = '';
        let rows: any[] = [];

        if (Array.isArray(data)) {
            rows = data;
        } else if (data && typeof data === 'object') {
            rows = Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
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

    private escapeCsvValue(value: any): string {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    private formatReportTitle(reportType: ReportType): string {
        return reportType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // ─── Scheduled Reports CRUD ──────────────────────────────────────────────────

    async createScheduledReport(tenantId: string, userId: string, dto: CreateScheduledReportDto) {
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

    async listScheduledReports(tenantId: string) {
        return this.prisma.scheduledReport.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getScheduledReport(tenantId: string, id: string) {
        const report = await this.prisma.scheduledReport.findFirst({
            where: { id, tenantId },
        });
        if (!report) throw new NotFoundException('Scheduled report not found');
        return report;
    }

    async deleteScheduledReport(tenantId: string, userId: string, id: string) {
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

    async toggleScheduledReport(tenantId: string, userId: string, id: string) {
        const report = await this.getScheduledReport(tenantId, id);
        const updated = await this.prisma.scheduledReport.update({
            where: { id },
            data: { isActive: !report.isActive },
        });
        return updated;
    }

    private calculateNextRun(frequency: ScheduleFrequency, time: string, dayOfWeek?: number, dayOfMonth?: number): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const next = new Date();
        next.setHours(hours, minutes, 0, 0);

        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }

        switch (frequency) {
            case ScheduleFrequency.DAILY:
                // Already set to tomorrow if past time
                break;
            case ScheduleFrequency.WEEKLY:
                if (dayOfWeek !== undefined) {
                    while (next.getDay() !== dayOfWeek) {
                        next.setDate(next.getDate() + 1);
                    }
                }
                break;
            case ScheduleFrequency.MONTHLY:
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
}
