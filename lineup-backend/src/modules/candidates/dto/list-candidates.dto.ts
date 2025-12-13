import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class ListCandidatesDto {
    @IsOptional() @IsString() stage?: string;
    @IsOptional() @IsString() source?: string;
    @IsOptional() @IsString() q?: string; // search text
    @IsOptional() @IsNumberString() page?: string;
    @IsOptional() @IsNumberString() perPage?: string;
    @IsOptional() @IsString() sort?: string; // e.g., createdAt:desc
}
