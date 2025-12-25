import { PrismaService } from '../../../common/prisma.service';
export declare class ZohoAuthRequiredError extends Error {
    constructor(message?: string);
}
export declare class ZohoOAuthService {
    private prisma;
    private readonly logger;
    private clientId;
    private clientSecret;
    private tokenUrl;
    constructor(prisma: PrismaService);
    isAuthError(error: any): boolean;
    markAuthRequired(tenantId: string, reason: string): Promise<void>;
    isAuthRequired(tenantId: string): Promise<boolean>;
    getAuthUrl(tenantId: string, redirectUri: string): string;
    exchangeCode(tenantId: string, code: string, redirectUri: string): Promise<{
        success: boolean;
        reconnected: boolean;
    }>;
    refreshToken(tenantId: string): Promise<string>;
    getAccessToken(tenantId: string): Promise<string>;
}
