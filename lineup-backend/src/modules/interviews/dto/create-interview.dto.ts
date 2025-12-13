import { IsString, IsArray, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateInterviewDto {
    @IsString() candidateId: string;
    @IsArray() interviewerIds: string[]; // user IDs
    @IsDateString() startAt: string; // ISO datetime in tenant timezone
    @IsInt() durationMins: number;
    @IsOptional() @IsString() stage?: string;
    @IsOptional() @IsString() location?: string;
    @IsOptional() @IsString() meetingLink?: string;
    @IsOptional() @IsString() notes?: string;
}
