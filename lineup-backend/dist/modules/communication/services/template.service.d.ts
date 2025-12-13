import { PrismaService } from '../../../common/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto';
import { Channel, TemplateCategory } from '@prisma/client';
export declare class TemplateService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, channel?: Channel, category?: TemplateCategory): Promise<{
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
    findOne(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, dto: CreateTemplateDto, userId?: string): Promise<{
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
    update(tenantId: string, id: string, dto: UpdateTemplateDto): Promise<{
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
    delete(tenantId: string, id: string): Promise<{
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
    duplicate(tenantId: string, id: string, newName: string): Promise<{
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
        portal: {
            name: string;
            description: string;
        }[];
    };
    getVersions(tenantId: string, name: string, channel: Channel): Promise<{
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
    private extractVariables;
    private registerHelpers;
}
