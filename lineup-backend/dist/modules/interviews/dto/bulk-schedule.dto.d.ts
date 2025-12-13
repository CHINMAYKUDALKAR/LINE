export declare enum BulkScheduleStrategy {
    AUTO = "AUTO",
    SAME_TIME = "SAME_TIME",
    PER_CANDIDATE = "PER_CANDIDATE"
}
export declare class BulkScheduleDto {
    candidateIds: string[];
    interviewerIds: string[];
    durationMins: number;
    strategy: BulkScheduleStrategy;
    stage?: string;
    scheduledTime?: string;
    rangeStart?: string;
    rangeEnd?: string;
    timezone?: string;
}
export interface BulkScheduleResult {
    total: number;
    scheduled: number;
    failed: number;
    interviews: Array<{
        candidateId: string;
        interviewId?: string;
        scheduledAt?: string;
        error?: string;
    }>;
}
