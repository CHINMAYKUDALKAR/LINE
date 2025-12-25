import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { GenerateDomainTokenDto } from './dto/generate-domain-token.dto';
import { VerifyDomainDto } from './dto/verify-domain.dto';
export declare class TenantsController {
    private svc;
    constructor(svc: TenantsService);
    create(req: any, dto: CreateTenantDto): Promise<{
        name: string;
        id: string;
        domain: string | null;
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
        name: string;
        id: string;
        domain: string | null;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(req: any, id: string): Promise<{
        name: string;
        id: string;
        domain: string | null;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(req: any, id: string, dto: UpdateTenantDto): Promise<{
        name: string;
        id: string;
        domain: string | null;
        domainVerified: boolean;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue | null;
        trialActive: boolean;
        trialEndsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateDomainToken(id: string, dto: GenerateDomainTokenDto): Promise<{
        token: string;
        instructions: {
            dns: string;
            http: string;
        };
    }>;
    verifyDomain(id: string, dto: VerifyDomainDto): Promise<{
        success: boolean;
    }>;
    getMyTenants(req: any): Promise<{
        id: string;
        name: string;
        domain: string | null;
        role: import("@prisma/client").$Enums.Role;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue;
        trialActive: boolean;
        trialEndsAt: Date | null;
    }[]>;
    getBranding(id: string): Promise<{
        name: string;
        id: string;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateBranding(req: any, id: string, dto: {
        logoUrl?: string;
        colors?: Record<string, string>;
    }): Promise<{
        name: string;
        id: string;
        brandingLogoUrl: string | null;
        brandingColors: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
