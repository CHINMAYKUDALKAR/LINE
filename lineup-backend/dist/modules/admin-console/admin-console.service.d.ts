import { OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
export declare class AdminConsoleService implements OnModuleDestroy {
    private prisma;
    private queue;
    private redisConnection;
    constructor(prisma: PrismaService);
    onModuleDestroy(): Promise<void>;
    createPlatformUser(dto: any, currentUserId: string): Promise<{
        id: string;
        password: any;
    }>;
    provisionTenant(dto: any, currentUserId: string): Promise<{
        tenantId: string;
        status: string;
    }>;
    listTenants(): Promise<{
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
    tenantStatus(tenantId: string): Promise<{
        tenantId: string;
        logs: {
            id: string;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            tenantId: string | null;
            userId: string | null;
            action: string;
            ip: string | null;
        }[];
    }>;
    createTenantAdmin(tenantId: string, email: string, adminUserId: string): Promise<{
        id: string;
        password: string;
    }>;
    assignUserRole(tenantId: string, userId: string, role: 'ADMIN' | 'MANAGER' | 'RECRUITER' | 'INTERVIEWER', adminUserId: string): Promise<{
        success: boolean;
        userId: string;
        oldRole: import("@prisma/client").$Enums.Role;
        newRole: "ADMIN" | "MANAGER" | "RECRUITER" | "INTERVIEWER";
        message: string;
    }>;
    updateTenantStatus(tenantId: string, enabled: boolean, adminUserId: string): Promise<{
        tenantId: string;
        enabled: boolean;
        updatedAt: Date;
    }>;
    getTenantDetails(tenantId: string): Promise<{
        integrations: {
            status: string | null;
            provider: string;
            lastSyncedAt: Date | null;
        }[];
        usage: {
            users: number;
            candidates: number;
            interviews: number;
        } | undefined;
        _count?: {
            users: number;
            candidates: number;
            interviews: number;
        } | undefined;
        id?: string | undefined;
        domain?: string | null | undefined;
        name?: string | undefined;
        domainVerified?: boolean | undefined;
        settings?: import("@prisma/client/runtime/library").JsonValue | undefined;
        brandingLogoUrl?: string | null | undefined;
        brandingColors?: import("@prisma/client/runtime/library").JsonValue | undefined;
        trialActive?: boolean | undefined;
        trialEndsAt?: Date | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>;
    listTenantUsers(tenantId: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
    }[]>;
    updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE', adminUserId: string): Promise<{
        userId: string;
        status: "ACTIVE" | "INACTIVE";
        updatedAt: Date;
    }>;
    listAllIntegrations(): Promise<({
        tenant: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: string | null;
        provider: string;
        tokens: import("@prisma/client/runtime/library").JsonValue | null;
        instanceUrl: string | null;
        lastSyncedAt: Date | null;
        lastError: string | null;
    })[]>;
    updateIntegrationStatus(tenantId: string, provider: string, enabled: boolean, adminUserId: string): Promise<{
        tenantId: string;
        provider: string;
        enabled: boolean;
        updatedAt: Date;
    }>;
    getIntegrationSummary(): Promise<Record<string, {
        connected: number;
        disabled: number;
        error: number;
    }>>;
    getSystemHealth(): Promise<{
        tenants: number;
        users: number;
        activeIntegrations: number;
        timestamp: string;
    }>;
}
