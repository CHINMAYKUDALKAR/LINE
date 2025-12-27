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
            subject: string | null;
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.MessageStatus;
            channel: import("@prisma/client").$Enums.Channel;
            recipientEmail: string | null;
        }[];
    }>;
    listMessages(req: any, filters: MessageFilterDto): Promise<{
        items: {
            subject: string | null;
            body: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            tenantId: string;
            status: import("@prisma/client").$Enums.MessageStatus;
            externalId: string | null;
            retryCount: number;
            channel: import("@prisma/client").$Enums.Channel;
            recipientType: import("@prisma/client").$Enums.RecipientType;
            recipientId: string;
            templateId: string | null;
            scheduledFor: Date | null;
            recipientEmail: string | null;
            recipientPhone: string | null;
            sentAt: Date | null;
            deliveredAt: Date | null;
            readAt: Date | null;
            failedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getMessage(req: any, id: string): Promise<{
        subject: string | null;
        body: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.MessageStatus;
        externalId: string | null;
        retryCount: number;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date | null;
        recipientEmail: string | null;
        recipientPhone: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        failedAt: Date | null;
    }>;
    sendMessage(req: any, dto: SendMessageDto): Promise<{
        subject: string | null;
        body: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.MessageStatus;
        externalId: string | null;
        retryCount: number;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date | null;
        recipientEmail: string | null;
        recipientPhone: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        failedAt: Date | null;
    }>;
    scheduleMessage(req: any, dto: ScheduleMessageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.ScheduleStatus;
        createdById: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        jobId: string | null;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date;
    }>;
    cancelScheduled(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.ScheduleStatus;
        createdById: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        jobId: string | null;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date;
    }>;
    retryMessage(req: any, id: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    getUpcomingScheduled(req: any, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.ScheduleStatus;
        createdById: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        jobId: string | null;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date;
    }[]>;
    listTemplates(req: any, channel?: Channel, category?: TemplateCategory): Promise<{
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
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
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
    }>;
    createTemplate(req: any, dto: CreateTemplateDto): Promise<{
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
    }>;
    updateTemplate(req: any, id: string, dto: UpdateTemplateDto): Promise<{
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
    }>;
    getTemplateVersions(req: any, id: string): Promise<{
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
    }[]>;
    deleteTemplate(req: any, id: string): Promise<{
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
    }>;
    previewTemplate(req: any, id: string, dto: PreviewTemplateDto): Promise<{
        subject: string;
        body: string;
    }>;
    duplicateTemplate(req: any, id: string, newName: string): Promise<{
        subject: string | null;
        body: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        tenantId: string;
        createdById: string | null;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        category: import("@prisma/client").$Enums.TemplateCategory;
        variables: string[];
        isSystem: boolean;
    }>;
    listAutomations(req: any): Promise<({
        template: {
            subject: string | null;
            body: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tenantId: string;
            createdById: string | null;
            isActive: boolean;
            channel: import("@prisma/client").$Enums.Channel;
            category: import("@prisma/client").$Enums.TemplateCategory;
            variables: string[];
            isSystem: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string | null;
        delay: number;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel | null;
        templateId: string | null;
        trigger: import("@prisma/client").$Enums.AutomationTrigger;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actionType: import("@prisma/client").$Enums.AutomationActionType;
        actionData: import("@prisma/client/runtime/library").JsonValue | null;
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
            subject: string | null;
            body: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tenantId: string;
            createdById: string | null;
            isActive: boolean;
            channel: import("@prisma/client").$Enums.Channel;
            category: import("@prisma/client").$Enums.TemplateCategory;
            variables: string[];
            isSystem: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string | null;
        delay: number;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel | null;
        templateId: string | null;
        trigger: import("@prisma/client").$Enums.AutomationTrigger;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actionType: import("@prisma/client").$Enums.AutomationActionType;
        actionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createAutomation(req: any, dto: CreateAutomationDto): Promise<{
        template: {
            subject: string | null;
            body: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tenantId: string;
            createdById: string | null;
            isActive: boolean;
            channel: import("@prisma/client").$Enums.Channel;
            category: import("@prisma/client").$Enums.TemplateCategory;
            variables: string[];
            isSystem: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string | null;
        delay: number;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel | null;
        templateId: string | null;
        trigger: import("@prisma/client").$Enums.AutomationTrigger;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actionType: import("@prisma/client").$Enums.AutomationActionType;
        actionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateAutomation(req: any, id: string, dto: UpdateAutomationDto): Promise<{
        template: {
            subject: string | null;
            body: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tenantId: string;
            createdById: string | null;
            isActive: boolean;
            channel: import("@prisma/client").$Enums.Channel;
            category: import("@prisma/client").$Enums.TemplateCategory;
            variables: string[];
            isSystem: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string | null;
        delay: number;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel | null;
        templateId: string | null;
        trigger: import("@prisma/client").$Enums.AutomationTrigger;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actionType: import("@prisma/client").$Enums.AutomationActionType;
        actionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteAutomation(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string | null;
        delay: number;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel | null;
        templateId: string | null;
        trigger: import("@prisma/client").$Enums.AutomationTrigger;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actionType: import("@prisma/client").$Enums.AutomationActionType;
        actionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    toggleAutomation(req: any, id: string): Promise<{
        template: {
            subject: string | null;
            body: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            version: number;
            tenantId: string;
            createdById: string | null;
            isActive: boolean;
            channel: import("@prisma/client").$Enums.Channel;
            category: import("@prisma/client").$Enums.TemplateCategory;
            variables: string[];
            isSystem: boolean;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdById: string | null;
        delay: number;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel | null;
        templateId: string | null;
        trigger: import("@prisma/client").$Enums.AutomationTrigger;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
        actionType: import("@prisma/client").$Enums.AutomationActionType;
        actionData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    listChannels(req: any): Promise<{
        credentials: Record<string, any>;
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }[]>;
    getChannel(req: any, channel: Channel): Promise<{
        credentials: Record<string, any>;
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }>;
    updateChannel(req: any, dto: ChannelConfigDto): Promise<{
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        credentials: import("@prisma/client/runtime/library").JsonValue;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }>;
    testChannel(req: any, channel: Channel): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteChannel(req: any, channel: Channel): Promise<{
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        credentials: import("@prisma/client/runtime/library").JsonValue;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }>;
}
