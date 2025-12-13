import { IsInt, IsString, IsOptional, IsObject, Min, Max } from 'class-validator';

export class SubmitFeedbackDto {
    @IsString() interviewId: string;
    @IsInt() @Min(1) @Max(5) rating: number;

    @IsOptional()
    @IsObject()
    criteria?: Record<string, number>; // e.g., { communication: 4, problemSolving: 5 }

    @IsOptional()
    @IsString()
    comments?: string;
}
