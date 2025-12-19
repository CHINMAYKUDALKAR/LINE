import { IsArray, IsISO8601, IsInt, IsString, IsEnum, IsOptional, Min, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BulkScheduleStrategy {
    AUTO = 'AUTO',
    SAME_TIME = 'SAME_TIME',
    PER_CANDIDATE = 'PER_CANDIDATE',
}

/**
 * DTO for bulk scheduling interviews for multiple candidates
 */
export class BulkScheduleDto {
    @ApiProperty({
        description: 'Array of candidate IDs to schedule',
        example: ['cand_123', 'cand_456', 'cand_789'],
        type: [String]
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    candidateIds: string[];

    @ApiProperty({
        description: 'Array of interviewer user IDs',
        example: ['user_abc', 'user_def'],
        type: [String]
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    interviewerIds: string[];

    @ApiProperty({ description: 'Interview duration in minutes (min 15)', example: 60, minimum: 15 })
    @IsInt()
    @Min(15)
    durationMins: number;

    @ApiProperty({
        description: 'Scheduling strategy',
        enum: BulkScheduleStrategy,
        example: BulkScheduleStrategy.AUTO
    })
    @IsEnum(BulkScheduleStrategy)
    strategy: BulkScheduleStrategy;

    @ApiPropertyOptional({ description: 'Interview stage/round', example: 'Technical Round' })
    @IsOptional()
    @IsString()
    stage?: string;

    @ApiPropertyOptional({
        description: 'For SAME_TIME strategy: the specific time to schedule all interviews',
        example: '2024-01-15T14:00:00Z'
    })
    @IsOptional()
    @IsISO8601()
    scheduledTime?: string;

    @ApiPropertyOptional({
        description: 'For AUTO strategy: start of scheduling range',
        example: '2024-01-15T09:00:00Z'
    })
    @IsOptional()
    @IsISO8601()
    rangeStart?: string;

    @ApiPropertyOptional({
        description: 'For AUTO strategy: end of scheduling range',
        example: '2024-01-20T18:00:00Z'
    })
    @IsOptional()
    @IsISO8601()
    rangeEnd?: string;

    @ApiPropertyOptional({ description: 'Timezone for scheduling', example: 'Asia/Kolkata' })
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
