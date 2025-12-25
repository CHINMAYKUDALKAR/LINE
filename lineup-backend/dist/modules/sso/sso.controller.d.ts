import { SSOService } from './sso.service';
import { InitiateSSODto } from './dto/initiate-sso.dto';
import { SSOCallbackDto } from './dto/sso-callback.dto';
export declare class SSOController {
    private readonly ssoService;
    constructor(ssoService: SSOService);
    getProviders(tenantId: string): Promise<{
        type: import("@prisma/client").$Enums.SSOProviderType;
        domainRestriction: string | null;
    }[]>;
    initiate(tenantId: string, dto: InitiateSSODto): Promise<{
        redirectUrl: string;
        provider: import("@prisma/client").$Enums.SSOProviderType;
        tenant: string;
        mock: boolean;
    }>;
    callback(tenantId: string, dto: SSOCallbackDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        tenant: {
            id: string;
            name: string;
        };
    }>;
}
