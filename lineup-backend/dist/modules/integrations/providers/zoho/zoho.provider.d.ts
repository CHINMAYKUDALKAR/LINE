import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { ZohoOAuthService } from './zoho.oauth';
import { ZohoApiService } from './zoho.api';
export declare class ZohoProvider implements IntegrationProvider {
    private prisma;
    private zohoOAuth;
    private zohoApi;
    constructor(prisma: PrismaService, zohoOAuth: ZohoOAuthService, zohoApi: ZohoApiService);
    getAuthUrl(tenantId: string, state?: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<void>;
    pushCandidate(tenantId: string, candidate: any): Promise<any>;
    pullCandidates(tenantId: string, since?: Date): Promise<any[]>;
    handleWebhook(tenantId: string, event: any): Promise<void>;
}
