import { PrismaService } from '../../../common/prisma.service';
import { CreateAutomationDto, UpdateAutomationDto } from '../dto';
import { AutomationTrigger } from '@prisma/client';
export declare class AutomationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, dto: CreateAutomationDto, userId?: string): Promise<{
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
    update(tenantId: string, id: string, dto: UpdateAutomationDto): Promise<{
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
    delete(tenantId: string, id: string): Promise<{
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
    toggle(tenantId: string, id: string): Promise<{
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
    getActiveRulesForTrigger(tenantId: string, trigger: AutomationTrigger): Promise<({
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
