import { IsString, IsOptional, IsArray, IsDateString, IsInt, Min } from 'class-validator';

export class AvailabilityQueryDto {
    @IsArray()
    @IsString({ each: true })
    userIds: string[];

    @IsDateString()
    start: string;

    @IsDateString()
    end: string;

    @IsOptional()
    @IsInt()
    @Min(15)
    durationMins?: number;

    @IsOptional()
    @IsString()
    timezone?: string;
}
