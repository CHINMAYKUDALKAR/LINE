import { IsOptional, IsString, IsDateString } from 'class-validator';

export class ListInterviewsDto {
    @IsOptional() @IsString() interviewerId?: string;
    @IsOptional() @IsString() candidateId?: string;
    @IsOptional() @IsDateString() from?: string;
    @IsOptional() @IsDateString() to?: string;
    @IsOptional() @IsString() status?: string;
    @IsOptional() @IsString() page?: string;
    @IsOptional() @IsString() perPage?: string;
    @IsOptional() @IsString() sort?: string;
}
