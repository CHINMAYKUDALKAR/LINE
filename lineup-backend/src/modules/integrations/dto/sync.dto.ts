import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class TriggerSyncDto {
    @IsString()
    @IsNotEmpty()
    provider: string;

    @IsOptional()
    @IsDateString()
    since?: string;
}
