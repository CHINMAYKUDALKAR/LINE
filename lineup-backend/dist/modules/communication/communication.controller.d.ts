import { MessageService } from './services/message.service';
import { TemplateService } from './services/template.service';
import { AutomationService } from './services/automation.service';
import { ChannelService } from './services/channel.service';
import { SchedulerService } from './services/scheduler.service';
import { SendMessageDto, ScheduleMessageDto, MessageFilterDto, CreateTemplateDto, UpdateTemplateDto, PreviewTemplateDto, CreateAutomationDto, UpdateAutomationDto, ChannelConfigDto } from './dto';
import { Channel, TemplateCategory } from '@prisma/client';
export declare class CommunicationController {
    private messageService;
    private templateService;
    private automationService;
    private channelService;
    private schedulerService;
    constructor(messageService: MessageService, templateService: TemplateService, automationService: AutomationService, channelService: ChannelService, schedulerService: SchedulerService);
    getStats(req: any): Promise<{
        totalSent: number;
        totalPending: number;
        totalFailed: number;
        totalScheduled: number;
        byChannel: {
            email: number;
            whatsapp: number;
            sms: number;
        };
        recentActivity: {
            id: string;
            subject: string | null;
            createdAt: Date;
            status: import(".prisma/client").$Enums.MessageStatus;
            channel: import(".prisma/client").$Enums.Channel;
            recipientEmail: string | null;
        }[];
    }>;
    listMessages(req: any, filters: MessageFilterDto): Promise<{
        items: {
            id: string;
            tenantId: string;
            channel: import(".prisma/client").$Enums.Channel;
            templateId: string | null;
            recipientType: import(".prisma/client").$Enums.RecipientType;
            recipientId: string;
            recipientEmail: string | null;
            recipientPhone: string | null;
            subject: string | null;
            body: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            externalId: string | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            scheduledFor: Date | null;
            sentAt: Date | null;
            deliveredAt: Date | null;
            readAt: Date | null;
            failedAt: Date | null;
            retryCount: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getMessage(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        recipientEmail: string | null;
        recipientPhone: string | null;
        subject: string | null;
        body: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        externalId: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        failedAt: Date | null;
        retryCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sendMessage(req: any, dto: SendMessageDto): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        recipientEmail: string | null;
        recipientPhone: string | null;
        subject: string | null;
        body: string;
        status: import(".prisma/client").$Enums.MessageStatus;
        externalId: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        failedAt: Date | null;
        retryCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    scheduleMessage(req: any, dto: ScheduleMessageDto): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        scheduledFor: Date;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        jobId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cancelScheduled(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        scheduledFor: Date;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        jobId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    retryMessage(req: any, id: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    getUpcomingScheduled(req: any, limit?: number): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        scheduledFor: Date;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        jobId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    listTemplates(req: any, channel?: Channel, category?: TemplateCategory): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAvailableVariables(): {
        candidate: {
            name: string;
            description: string;
        }[];
        interview: {
            name: string;
            description: string;
        }[];
        interviewer: {
            name: string;
            description: string;
        }[];
        company: {
            name: string;
            description: string;
        }[];
    };
    getTemplate(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTemplate(req: any, dto: CreateTemplateDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTemplate(req: any, id: string, dto: UpdateTemplateDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTemplateVersions(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    deleteTemplate(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    previewTemplate(req: any, id: string, dto: PreviewTemplateDto): Promise<{
        subject: string;
        body: string;
    }>;
    duplicateTemplate(req: any, id: string, newName: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        channel: import(".prisma/client").$Enums.Channel;
        category: import(".prisma/client").$Enums.TemplateCategory;
        subject: string | null;
        body: string;
        variables: string[];
        isSystem: boolean;
        isActive: boolean;
        version: number;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listAutomations(req: any): Promise<({
        template: {
            id: string;
            tenantId: string;
            name: string;
            channel: import(".prisma/client").$Enums.Channel;
            category: import(".prisma/client").$Enums.TemplateCategory;
            subject: string | null;
            body: string;
            variables: string[];
            isSystem: boolean;
            isActive: boolean;
            version: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        tenantId: string;
        name: string;
        trigger: import(".prisma/client").$Enums.AutomationTrigger;
        conditions: import(".prisma/client").Prisma.JsonValue | null;
        actionType: import(".prisma/client").$Enums.AutomationActionType;
        actionData: import(".prisma/client").Prisma.JsonValue | null;
        channel: import(".prisma/client").$Enums.Channel | null;
        templateId: string | null;
        delay: number;
        isActive: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getAvailableTriggers(): ({
        trigger: "INTERVIEW_SCHEDULED";
        description: string;
    } | {
        trigger: "INTERVIEW_REMINDER_24H";
        description: string;
    } | {
        trigger: "INTERVIEW_REMINDER_1H";
        description: string;
    } | {
        trigger: "INTERVIEW_RESCHEDULED";
        description: string;
    } | {
        trigger: "INTERVIEW_CANCELLED";
        description: string;
    } | {
        trigger: "INTERVIEW_COMPLETED";
        description: string;
    } | {
        trigger: "FEEDBACK_SUBMITTED";
        description: string;
    } | {
        trigger: "CANDIDATE_STAGE_CHANGED";
        description: string;
    } | {
        trigger: "OFFER_EXTENDED";
        description: string;
    })[];
    getAutomation(req: any, id: string): Promise<{
        template: {
            id: string;
            tenantId: string;
            name: string;
            channel: import(".prisma/client").$Enums.Channel;
            category: import(".prisma/client").$Enums.TemplateCategory;
            subject: string | null;
            body: string;
            variables: string[];
            isSystem: boolean;
            isActive: boolean;
            version: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        tenantId: string;
        name: string;
        trigger: import(".prisma/client").$Enums.AutomationTrigger;
        conditions: import(".prisma/client").Prisma.JsonValue | null;
        actionType: import(".prisma/client").$Enums.AutomationActionType;
        actionData: import(".prisma/client").Prisma.JsonValue | null;
        channel: import(".prisma/client").$Enums.Channel | null;
        templateId: string | null;
        delay: number;
        isActive: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createAutomation(req: any, dto: CreateAutomationDto): Promise<{
        template: {
            id: string;
            tenantId: string;
            name: string;
            channel: import(".prisma/client").$Enums.Channel;
            category: import(".prisma/client").$Enums.TemplateCategory;
            subject: string | null;
            body: string;
            variables: string[];
            isSystem: boolean;
            isActive: boolean;
            version: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        tenantId: string;
        name: string;
        trigger: import(".prisma/client").$Enums.AutomationTrigger;
        conditions: import(".prisma/client").Prisma.JsonValue | null;
        actionType: import(".prisma/client").$Enums.AutomationActionType;
        actionData: import(".prisma/client").Prisma.JsonValue | null;
        channel: import(".prisma/client").$Enums.Channel | null;
        templateId: string | null;
        delay: number;
        isActive: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAutomation(req: any, id: string, dto: UpdateAutomationDto): Promise<{
        template: {
            id: string;
            tenantId: string;
            name: string;
            channel: import(".prisma/client").$Enums.Channel;
            category: import(".prisma/client").$Enums.TemplateCategory;
            subject: string | null;
            body: string;
            variables: string[];
            isSystem: boolean;
            isActive: boolean;
            version: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        tenantId: string;
        name: string;
        trigger: import(".prisma/client").$Enums.AutomationTrigger;
        conditions: import(".prisma/client").Prisma.JsonValue | null;
        actionType: import(".prisma/client").$Enums.AutomationActionType;
        actionData: import(".prisma/client").Prisma.JsonValue | null;
        channel: import(".prisma/client").$Enums.Channel | null;
        templateId: string | null;
        delay: number;
        isActive: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteAutomation(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        trigger: import(".prisma/client").$Enums.AutomationTrigger;
        conditions: import(".prisma/client").Prisma.JsonValue | null;
        actionType: import(".prisma/client").$Enums.AutomationActionType;
        actionData: import(".prisma/client").Prisma.JsonValue | null;
        channel: import(".prisma/client").$Enums.Channel | null;
        templateId: string | null;
        delay: number;
        isActive: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleAutomation(req: any, id: string): Promise<{
        template: {
            id: string;
            tenantId: string;
            name: string;
            channel: import(".prisma/client").$Enums.Channel;
            category: import(".prisma/client").$Enums.TemplateCategory;
            subject: string | null;
            body: string;
            variables: string[];
            isSystem: boolean;
            isActive: boolean;
            version: number;
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        tenantId: string;
        name: string;
        trigger: import(".prisma/client").$Enums.AutomationTrigger;
        conditions: import(".prisma/client").Prisma.JsonValue | null;
        actionType: import(".prisma/client").$Enums.AutomationActionType;
        actionData: import(".prisma/client").Prisma.JsonValue | null;
        channel: import(".prisma/client").$Enums.Channel | null;
        templateId: string | null;
        delay: number;
        isActive: boolean;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listChannels(req: any): Promise<{
        credentials: Record<string, any>;
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getChannel(req: any, channel: Channel): Promise<{
        credentials: Record<string, any>;
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateChannel(req: any, dto: ChannelConfigDto): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        credentials: import(".prisma/client").Prisma.JsonValue;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    testChannel(req: any, channel: Channel): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteChannel(req: any, channel: Channel): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        credentials: import(".prisma/client").Prisma.JsonValue;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
