import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ConnectDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['zoho', 'google_calendar', 'outlook_calendar'])
    provider: string;
}
