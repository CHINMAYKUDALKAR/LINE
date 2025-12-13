import { PrismaService } from '../../../common/prisma.service';
export declare class GoogleCalendarOAuthService {
    private prisma;
    private readonly logger;
    private readonly clientId;
    private readonly clientSecret;
    private readonly authUrl;
    private readonly tokenUrl;
    private readonly scopes;
    constructor(prisma: PrismaService);
    getAuthUrl(tenantId: string, userId: string, redirectUri: string): string;
    exchangeCode(tenantId: string, userId: string, code: string, redirectUri: string): Promise<{
        success: boolean;
        accountId: string;
    }>;
    refreshAccessToken(accountId: string): Promise<string>;
    getValidAccessToken(accountId: string): Promise<string>;
    disconnect(tenantId: string, userId: string): Promise<void>;
}
