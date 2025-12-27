import { PrismaService } from '../../common/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Queue } from 'bullmq';
export declare class TenantsService {
    private prisma;
    private domainQueue;
    private domainVerifyRateLimiter;
    constructor(prisma: PrismaService, domainQueue: Queue);
    create(dto: CreateTenantDto, userId: string): Promise<{
        id: string;
        domain: string | null;
        name: string;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        domain: string | null;
        name: string;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        domain: string | null;
        name: string;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateTenantDto, userId: string): Promise<{
        id: string;
        domain: string | null;
        name: string;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateDomainVerificationToken(tenantId: string, domain: string): Promise<{
        token: string;
        instructions: {
            dns: string;
            http: string;
        };
    }>;
    verifyDomain(tenantId: string, token: string): Promise<{
        success: boolean;
    }>;
    getTenantsForUser(userId: string): Promise<{
        id: string;
        name: string;
        domain: string | null;
        role: import("@prisma/client").$Enums.Role;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue;
        trialActive: boolean;
        trialEndsAt: Date | null;
    }[]>;
    getBranding(tenantId: string): Promise<{
        id: string;
        name: string;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    private isValidHexColor;
    updateBranding(tenantId: string, userId: string, branding: {
        logoUrl?: string;
        colors?: Record<string, string>;
    }): Promise<{
        id: string;
        name: string;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
