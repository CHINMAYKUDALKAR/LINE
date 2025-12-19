export declare class RescheduleInterviewDto {
    newStartAt: string;
    newDurationMins: number;
}
export declare class ConflictInfoDto {
    interviewId: string;
    date: Date;
    duration: number;
    stage?: string;
}
export declare class RescheduleResponseDto {
    interview: any;
    conflicts: ConflictInfoDto[];
    hasConflicts: boolean;
    message: string;
}
