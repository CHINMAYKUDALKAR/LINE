import { PrismaService } from '../../../common/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto';
import { Channel, TemplateCategory } from '@prisma/client';
export declare class TemplateService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, channel?: Channel, category?: TemplateCategory): Promise<{
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
    findOne(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, dto: CreateTemplateDto, userId?: string): Promise<{
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
    update(tenantId: string, id: string, dto: UpdateTemplateDto): Promise<{
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
    delete(tenantId: string, id: string): Promise<{
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
    duplicate(tenantId: string, id: string, newName: string): Promise<{
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
    preview(template: {
        subject?: string;
        body: string;
    }, context: Record<string, any>): {
        subject: string;
        body: string;
    };
    render(templateString: string, context: Record<string, any>): string;
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
    getVersions(tenantId: string, name: string, channel: Channel): Promise<{
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
    private extractVariables;
    private registerHelpers;
}
