import { PrismaService } from '../../common/prisma.service';
export declare class AdminConsoleService {
    private prisma;
    private queue;
    constructor(prisma: PrismaService);
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
        name: string;
        domain: string | null;
        domainVerified: boolean;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import(".prisma/client").Prisma.JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    tenantStatus(tenantId: string): Promise<{
        tenantId: string;
        logs: {
            id: string;
            tenantId: string | null;
            userId: string | null;
            action: string;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            ip: string | null;
            createdAt: Date;
        }[];
    }>;
    createTenantAdmin(tenantId: string, email: string, adminUserId: string): Promise<{
        id: string;
        password: string;
    }>;
    assignUserRole(tenantId: string, userId: string, role: 'ADMIN' | 'MANAGER' | 'RECRUITER' | 'INTERVIEWER', adminUserId: string): Promise<{
        success: boolean;
        userId: string;
        oldRole: import(".prisma/client").$Enums.Role;
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
        name?: string | undefined;
        domain?: string | null | undefined;
        domainVerified?: boolean | undefined;
        settings?: import(".prisma/client").Prisma.JsonValue | undefined;
        brandingLogoUrl?: string | null | undefined;
        brandingColors?: import(".prisma/client").Prisma.JsonValue | undefined;
        trialActive?: boolean | undefined;
        trialEndsAt?: Date | null | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>;
    listTenantUsers(tenantId: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
    }[]>;
    updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE', adminUserId: string): Promise<{
        userId: string;
        status: "ACTIVE" | "INACTIVE";
        updatedAt: Date;
    }>;
    listAllIntegrations(): Promise<({
        tenant: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        tenantId: string;
        provider: string;
        tokens: import(".prisma/client").Prisma.JsonValue | null;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        status: string | null;
        lastSyncedAt: Date | null;
        lastError: string | null;
        createdAt: Date;
        updatedAt: Date;
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
