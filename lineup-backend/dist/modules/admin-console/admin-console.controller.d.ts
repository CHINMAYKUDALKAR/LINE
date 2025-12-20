import { AdminConsoleService } from './admin-console.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { CreateTenantProvisionDto } from './dto/create-tenant-provision.dto';
export declare class AdminConsoleController {
    private svc;
    constructor(svc: AdminConsoleService);
    createPlatformUser(req: any, dto: CreatePlatformUserDto): Promise<{
        id: string;
        password: any;
    }>;
    provisionTenant(req: any, dto: CreateTenantProvisionDto): Promise<{
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
    getTenantDetails(id: string): Promise<{
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
    tenantStatus(id: string): Promise<{
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
    updateTenantStatus(req: any, id: string, body: {
        enabled: boolean;
    }): Promise<{
        tenantId: string;
        enabled: boolean;
        updatedAt: Date;
    }>;
    createTenantAdmin(req: any, id: string, email: string): Promise<{
        id: string;
        password: string;
    }>;
    assignUserRole(req: any, tenantId: string, userId: string, role: 'ADMIN' | 'MANAGER' | 'RECRUITER' | 'INTERVIEWER'): Promise<{
        success: boolean;
        userId: string;
        oldRole: import(".prisma/client").$Enums.Role;
        newRole: "ADMIN" | "MANAGER" | "RECRUITER" | "INTERVIEWER";
        message: string;
    }>;
    listTenantUsers(id: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
    }[]>;
    updateUserStatus(req: any, id: string, body: {
        status: 'ACTIVE' | 'INACTIVE';
    }): Promise<{
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
    getIntegrationSummary(): Promise<Record<string, {
        connected: number;
        disabled: number;
        error: number;
    }>>;
    updateIntegrationStatus(req: any, tenantId: string, provider: string, body: {
        enabled: boolean;
    }): Promise<{
        tenantId: string;
        provider: string;
        enabled: boolean;
        updatedAt: Date;
    }>;
    getSystemHealth(): Promise<{
        tenants: number;
        users: number;
        activeIntegrations: number;
        timestamp: string;
    }>;
}
