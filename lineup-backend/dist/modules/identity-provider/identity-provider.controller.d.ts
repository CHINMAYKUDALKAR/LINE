import { IdentityProviderService } from './identity-provider.service';
import { CreateIdentityProviderDto } from './dto/create-identity-provider.dto';
import { UpdateIdentityProviderDto } from './dto/update-identity-provider.dto';
export declare class IdentityProviderController {
    private readonly identityProviderService;
    constructor(identityProviderService: IdentityProviderService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        enabled: boolean;
        createdById: string | null;
        redirectUri: string | null;
        clientId: string | null;
        clientSecret: string | null;
        providerType: import("@prisma/client").$Enums.SSOProviderType;
        domainRestriction: string | null;
        samlMetadataUrl: string | null;
        samlEntityId: string | null;
        samlCertificate: string | null;
        samlAcsUrl: string | null;
        samlSsoUrl: string | null;
        samlLogoutUrl: string | null;
        autoProvision: boolean;
        updatedById: string | null;
    }[]>;
    findOne(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        enabled: boolean;
        createdById: string | null;
        redirectUri: string | null;
        clientId: string | null;
        clientSecret: string | null;
        providerType: import("@prisma/client").$Enums.SSOProviderType;
        domainRestriction: string | null;
        samlMetadataUrl: string | null;
        samlEntityId: string | null;
        samlCertificate: string | null;
        samlAcsUrl: string | null;
        samlSsoUrl: string | null;
        samlLogoutUrl: string | null;
        autoProvision: boolean;
        updatedById: string | null;
    }>;
    create(req: any, dto: CreateIdentityProviderDto): Promise<any>;
    update(req: any, id: string, dto: UpdateIdentityProviderDto): Promise<any>;
    delete(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggle(req: any, id: string, body: {
        enabled: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        enabled: boolean;
        createdById: string | null;
        redirectUri: string | null;
        clientId: string | null;
        clientSecret: string | null;
        providerType: import("@prisma/client").$Enums.SSOProviderType;
        domainRestriction: string | null;
        samlMetadataUrl: string | null;
        samlEntityId: string | null;
        samlCertificate: string | null;
        samlAcsUrl: string | null;
        samlSsoUrl: string | null;
        samlLogoutUrl: string | null;
        autoProvision: boolean;
        updatedById: string | null;
    }>;
}
