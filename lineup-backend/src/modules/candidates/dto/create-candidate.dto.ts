import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class CreateCandidateDto {
    @IsString() name: string;
    @IsOptional() @IsEmail() email?: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsString() roleTitle?: string;
    @IsOptional() @IsString() stage?: string;
    @IsOptional() @IsString() source?: string;
    @IsOptional() @IsArray() tags?: string[];
}
