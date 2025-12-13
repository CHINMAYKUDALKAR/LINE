import { PrismaService } from '../../common/prisma.service';
import { CreateScheduledReportDto, ReportType } from './dto/scheduled-report.dto';
export declare class ReportsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getReport(tenantId: string, name: string, forceRefresh?: boolean): Promise<unknown>;
    funnel(tenantId: string, force?: boolean): Promise<unknown>;
    timeToHire(tenantId: string, force?: boolean): Promise<any>;
    interviewerLoad(tenantId: string, force?: boolean): Promise<unknown>;
    sourcePerformance(tenantId: string, force?: boolean): Promise<unknown>;
    stageMetrics(tenantId: string, force?: boolean): Promise<unknown>;
    overview(tenantId: string, force?: boolean): Promise<{
        funnel: unknown;
        timeToHire: any;
        interviewerLoad: unknown;
    }>;
    getReportData(tenantId: string, reportType: ReportType, force?: boolean): Promise<any>;
    exportToCsv(tenantId: string, reportType: ReportType): Promise<{
        filename: string;
        content: string;
    }>;
    exportToPdf(tenantId: string, reportType: ReportType): Promise<{
        filename: string;
        html: string;
    }>;
    private escapeCsvValue;
    private formatReportTitle;
    createScheduledReport(tenantId: string, userId: string, dto: CreateScheduledReportDto): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        reportType: string;
        frequency: string;
        recipients: string[];
        dayOfWeek: number | null;
        dayOfMonth: number | null;
        time: string;
        name: string | null;
        isActive: boolean;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listScheduledReports(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        reportType: string;
        frequency: string;
        recipients: string[];
        dayOfWeek: number | null;
        dayOfMonth: number | null;
        time: string;
        name: string | null;
        isActive: boolean;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getScheduledReport(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        reportType: string;
        frequency: string;
        recipients: string[];
        dayOfWeek: number | null;
        dayOfMonth: number | null;
        time: string;
        name: string | null;
        isActive: boolean;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteScheduledReport(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    toggleScheduledReport(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        reportType: string;
        frequency: string;
        recipients: string[];
        dayOfWeek: number | null;
        dayOfMonth: number | null;
        time: string;
        name: string | null;
        isActive: boolean;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private calculateNextRun;
}
