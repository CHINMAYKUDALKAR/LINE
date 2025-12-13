import { PrismaService } from '../../../common/prisma.service';
export interface SchedulingMetrics {
    interviewsToday: number;
    rescheduledToday: number;
    cancelledToday: number;
    availabilityEngineAvgMs: number;
    avgTimeToFirstInterviewHours: number;
}
export declare class SchedulingMetricsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMetrics(): Promise<SchedulingMetrics>;
}
