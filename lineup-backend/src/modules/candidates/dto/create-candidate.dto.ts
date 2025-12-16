import { IsString, IsOptional, IsEmail, IsArray, MaxLength, Matches } from 'class-validator';

export class CreateCandidateDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    @Matches(/^[+]?[\d\s\-().]+$/, { message: 'Invalid phone format' })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    roleTitle?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    stage?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    source?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(50, { each: true })
    tags?: string[];
}

