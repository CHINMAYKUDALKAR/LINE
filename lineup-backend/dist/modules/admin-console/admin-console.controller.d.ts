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
    createTenantAdmin(id: string, email: string): Promise<{
        id: string;
        password: string;
    }>;
}
