import { PrismaService } from '../../common/prisma.service';
import { IdentityProviderService } from '../identity-provider/identity-provider.service';
import { InitiateSSODto } from './dto/initiate-sso.dto';
import { SSOCallbackDto } from './dto/sso-callback.dto';
export declare class SSOService {
    private prisma;
    private identityProviderService;
    constructor(prisma: PrismaService, identityProviderService: IdentityProviderService);
    initiate(tenantId: string, callerRole: string | undefined, dto: InitiateSSODto): Promise<{
        redirectUrl: string;
        provider: import(".prisma/client").$Enums.SSOProviderType;
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
            role: import(".prisma/client").$Enums.Role;
        };
        tenant: {
            id: string;
            name: string;
        };
    }>;
    getAvailableProviders(tenantId: string): Promise<{
        type: import(".prisma/client").$Enums.SSOProviderType;
        domainRestriction: string | null;
    }[]>;
}
