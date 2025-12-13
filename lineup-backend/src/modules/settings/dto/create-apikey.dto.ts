import { IsString, IsArray } from 'class-validator';

export class CreateApiKeyDto {
    @IsString() name: string;
    @IsArray() scopes: string[];
}
