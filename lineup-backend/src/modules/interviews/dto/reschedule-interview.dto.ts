import { IsString, IsDateString, IsInt } from 'class-validator';

export class RescheduleInterviewDto {
    // interviewId passed via Param usually
    @IsDateString() newStartAt: string;
    @IsInt() newDurationMins: number;
}
