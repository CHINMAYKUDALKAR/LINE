import { Channel, RecipientType, MessageStatus, TemplateCategory, AutomationTrigger } from '@prisma/client';
export declare class SendMessageDto {
    channel: Channel;
    recipientType: RecipientType;
    recipientId: string;
    templateId?: string;
    subject?: string;
    body?: string;
    context?: Record<string, any>;
}
export declare class ScheduleMessageDto extends SendMessageDto {
    scheduledFor: Date;
}
export declare class MessageFilterDto {
    channel?: Channel;
    status?: MessageStatus;
    recipientType?: RecipientType;
    recipientId?: string;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class CreateTemplateDto {
    name: string;
    channel: Channel;
    category: TemplateCategory;
    subject?: string;
    body: string;
    variables?: string[];
}
export declare class UpdateTemplateDto {
    name?: string;
    subject?: string;
    body?: string;
    variables?: string[];
    isActive?: boolean;
}
export declare class PreviewTemplateDto {
    context: Record<string, any>;
}
export declare class CreateAutomationDto {
    name: string;
    trigger: AutomationTrigger;
    channel: Channel;
    templateId: string;
    delay?: number;
    conditions?: Record<string, any>;
}
export declare class UpdateAutomationDto {
    name?: string;
    templateId?: string;
    delay?: number;
    conditions?: Record<string, any>;
    isActive?: boolean;
}
export declare class EmailConfigDto {
    provider: 'smtp' | 'ses';
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    fromAddress?: string;
    fromName?: string;
    region?: string;
}
export declare class WhatsAppConfigDto {
    businessId: string;
    phoneNumberId: string;
    accessToken: string;
    webhookVerifyToken?: string;
}
export declare class SMSConfigDto {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    fromNumber: string;
}
export declare class ChannelConfigDto {
    channel: Channel;
    credentials: EmailConfigDto | WhatsAppConfigDto | SMSConfigDto;
    settings?: Record<string, any>;
}
export declare class CommunicationStatsDto {
    totalSent: number;
    totalPending: number;
    totalFailed: number;
    totalScheduled: number;
    byChannel: {
        email: number;
        whatsapp: number;
        sms: number;
    };
    recentActivity: any[];
}
