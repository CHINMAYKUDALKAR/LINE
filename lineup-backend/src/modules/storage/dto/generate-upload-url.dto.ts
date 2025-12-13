import { IsString, IsOptional } from 'class-validator';

export class GenerateUploadUrlDto {
    @IsString()
    filename: string;

    @IsOptional()
    @IsString()
    linkedType?: string; // 'candidate' | 'interview' | 'user'

    @IsOptional()
    @IsString()
    linkedId?: string;
}
