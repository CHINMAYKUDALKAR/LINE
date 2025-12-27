import { PrismaService } from '../../../common/prisma.service';
import { CreateAutomationDto, UpdateAutomationDto } from '../dto';
import { AutomationTrigger } from '@prisma/client';
export declare class AutomationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, dto: CreateAutomationDto, userId?: string): Promise<{
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
    update(tenantId: string, id: string, dto: UpdateAutomationDto): Promise<{
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
    delete(tenantId: string, id: string): Promise<{
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
    toggle(tenantId: string, id: string): Promise<{
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
    getActiveRulesForTrigger(tenantId: string, trigger: AutomationTrigger): Promise<({
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
    processTrigger(tenantId: string, trigger: AutomationTrigger, context: {
        candidateId?: string;
        interviewId?: string;
        userId?: string;
        data?: Record<string, any>;
    }): Promise<{
        processed: number;
        queued: number;
    }>;
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
}
