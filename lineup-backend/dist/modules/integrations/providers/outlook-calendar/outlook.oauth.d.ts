import { PrismaService } from '../../../../common/prisma.service';
import { OAuthTokenSet } from '../../types/oauth.interface';
export declare class OutlookOAuthService {
    private prisma;
    private readonly authUrl;
    private readonly tokenUrl;
    constructor(prisma: PrismaService);
    getAuthUrl(tenantId: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<OAuthTokenSet>;
    getValidToken(tenantId: string): Promise<string>;
}
