export declare enum ReportType {
    OVERVIEW = "overview",
    FUNNEL = "funnel",
    TIME_TO_HIRE = "time-to-hire",
    INTERVIEWER_LOAD = "interviewer-load",
    SOURCE_PERFORMANCE = "source-performance",
    STAGE_METRICS = "stage-metrics"
}
export declare enum ScheduleFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
export declare class CreateScheduledReportDto {
    reportType: ReportType;
    frequency: ScheduleFrequency;
    recipients: string[];
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    name?: string;
}
export declare class ScheduledReportResponseDto {
    id: string;
    tenantId: string;
    reportType: ReportType;
    frequency: ScheduleFrequency;
    recipients: string[];
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    name?: string;
    isActive: boolean;
    lastRunAt?: Date;
    nextRunAt?: Date;
    createdAt: Date;
    createdById: string;
}
export declare enum ExportFormat {
    CSV = "csv",
    PDF = "pdf"
}
