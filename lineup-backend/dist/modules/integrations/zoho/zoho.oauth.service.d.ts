import { PrismaService } from '../../../common/prisma.service';
export declare class ZohoOAuthService {
    private prisma;
    private clientId;
    private clientSecret;
    private tokenUrl;
    constructor(prisma: PrismaService);
    getAuthUrl(tenantId: string, redirectUri: string): string;
    exchangeCode(tenantId: string, code: string, redirectUri: string): Promise<{
        success: boolean;
    }>;
    refreshToken(tenantId: string): Promise<any>;
    getAccessToken(tenantId: string): Promise<string>;
}
