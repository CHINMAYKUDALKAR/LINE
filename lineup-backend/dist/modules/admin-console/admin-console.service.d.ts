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
    createTenantAdmin(tenantId: string, email: string): Promise<{
        id: string;
        password: string;
    }>;
}
