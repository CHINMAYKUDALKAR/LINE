import { IsArray, IsISO8601, IsInt, IsString, IsEnum, IsOptional, Min, ArrayMinSize } from 'class-validator';

export enum BulkScheduleStrategy {
    AUTO = 'AUTO',
    SAME_TIME = 'SAME_TIME',
    PER_CANDIDATE = 'PER_CANDIDATE',
}

/**
 * DTO for bulk scheduling interviews for multiple candidates
 */
export class BulkScheduleDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    candidateIds: string[];

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    interviewerIds: string[];

    @IsInt()
    @Min(15)
    durationMins: number;

    @IsEnum(BulkScheduleStrategy)
    strategy: BulkScheduleStrategy;

    @IsOptional()
    @IsString()
    stage?: string;

    /**
     * For SAME_TIME strategy: the specific time to schedule all interviews
     */
    @IsOptional()
    @IsISO8601()
    scheduledTime?: string;

    /**
     * For AUTO strategy: start of scheduling range
     */
    @IsOptional()
    @IsISO8601()
    rangeStart?: string;

    /**
     * For AUTO strategy: end of scheduling range
     */
    @IsOptional()
    @IsISO8601()
    rangeEnd?: string;

    @IsOptional()
    @IsString()
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
