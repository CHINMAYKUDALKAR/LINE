export declare enum BulkMode {
    SEQUENTIAL = "SEQUENTIAL",
    GROUP = "GROUP"
}
export declare enum BulkScheduleStrategy {
    AUTO = "AUTO",
    SAME_TIME = "SAME_TIME",
    PER_CANDIDATE = "PER_CANDIDATE"
}
export declare class BulkScheduleDto {
    candidateIds: string[];
    interviewerIds: string[];
    durationMins: number;
    bulkMode: BulkMode;
    startTime: string;
    stage?: string;
    timezone?: string;
    strategy?: BulkScheduleStrategy;
    scheduledTime?: string;
}
export interface BulkScheduleResult {
    total: number;
    scheduled: number;
    skipped: number;
    bulkBatchId: string;
    bulkMode: BulkMode;
    created: Array<{
        candidateId: string;
        interviewId: string;
        scheduledAt: string;
    }>;
    skippedCandidates: Array<{
        candidateId: string;
        reason: string;
    }>;
}
