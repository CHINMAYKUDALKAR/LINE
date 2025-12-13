import { client } from './client';

export type ReportType =
    | 'overview'
    | 'funnel'
    | 'time-to-hire'
    | 'interviewer-load'
    | 'source-performance'
    | 'stage-metrics';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduledReport {
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
    lastRunAt?: string;
    nextRunAt?: string;
    createdAt: string;
    createdById: string;
}

export interface CreateScheduledReportDto {
    reportType: ReportType;
    frequency: ScheduleFrequency;
    recipients: string[];
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    name?: string;
}

// ─── Report Data Types ───────────────────────────────────────────────────────

export interface OverviewReport {
    funnel: FunnelStage[];
    timeToHire: TimeToHireData;
    interviewerLoad: InterviewerLoadData[];
    totalCandidates: number;
    activeInterviews: number;
    completedThisWeek: number;
    pendingFeedback: number;
}

export interface FunnelStage {
    stage: string;
    count: number;
    percentage?: number;
}

export interface TimeToHireData {
    averageDays: number;
    byStage?: {
        stage: string;
        averageDays: number;
    }[];
}

export interface InterviewerLoadData {
    interviewerId: string;
    interviewerName: string;
    totalInterviews: number;
    thisWeek: number;
    thisMonth: number;
    pendingFeedback: number;
}

// ─── Report Data API Functions ───────────────────────────────────────────────

export async function getOverview(refresh = false): Promise<OverviewReport> {
    const params = refresh ? { refresh: 'true' } : undefined;
    return client.get<OverviewReport>('/reports/overview', { params });
}

export async function getFunnel(refresh = false): Promise<FunnelStage[]> {
    const params = refresh ? { refresh: 'true' } : undefined;
    return client.get<FunnelStage[]>('/reports/funnel', { params });
}

export async function getTimeToHire(refresh = false): Promise<TimeToHireData> {
    const params = refresh ? { refresh: 'true' } : undefined;
    return client.get<TimeToHireData>('/reports/time-to-hire', { params });
}

export async function getInterviewerLoad(refresh = false): Promise<InterviewerLoadData[]> {
    const params = refresh ? { refresh: 'true' } : undefined;
    return client.get<InterviewerLoadData[]>('/reports/interviewer-load', { params });
}

// ─── Export Functions ────────────────────────────────────────────────────────

export async function exportReportCsv(reportType: ReportType): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('accessToken');
    const tenantId = localStorage.getItem('activeTenantId');

    console.log('[Export CSV] Starting export for:', reportType);
    console.log('[Export CSV] Token present:', !!token);
    console.log('[Export CSV] Tenant ID:', tenantId);

    const response = await fetch(`${apiUrl}/api/v1/reports/export/csv/${reportType}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Id': tenantId || '',
        },
        credentials: 'include',
    });

    console.log('[Export CSV] Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Export CSV] Error:', errorText);
        throw new Error(`Failed to export report: ${response.status} ${errorText}`);
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `${reportType}-report.csv`;

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    console.log('[Export CSV] Download complete:', filename);
}

export async function exportReportPdf(reportType: ReportType): Promise<void> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/v1/reports/export/pdf/${reportType}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'X-Tenant-Id': localStorage.getItem('activeTenantId') || '',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to export report');
    }

    const html = await response.text();
    const filename = response.headers.get('X-Filename') || `${reportType}-report.pdf`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    }
}

// ─── Scheduled Reports API ───────────────────────────────────────────────────

export async function getScheduledReports(): Promise<ScheduledReport[]> {
    return client.get<ScheduledReport[]>('/reports/schedules');
}

export async function createScheduledReport(dto: CreateScheduledReportDto): Promise<ScheduledReport> {
    return client.post<ScheduledReport>('/reports/schedules', dto);
}

export async function deleteScheduledReport(id: string): Promise<void> {
    await client.delete(`/reports/schedules/${id}`);
}

export async function toggleScheduledReport(id: string): Promise<ScheduledReport> {
    return client.post<ScheduledReport>(`/reports/schedules/${id}/toggle`);
}
