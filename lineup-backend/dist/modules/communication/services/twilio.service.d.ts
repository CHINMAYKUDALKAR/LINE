import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface SmsSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare class TwilioService implements OnModuleInit {
    private configService;
    private readonly logger;
    private client;
    private fromNumber;
    private isMockMode;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    isEnabled(): boolean;
    sendSms(to: string, body: string): Promise<SmsSendResult>;
    private mockSend;
    isValidPhoneNumber(phone: string): boolean;
}
