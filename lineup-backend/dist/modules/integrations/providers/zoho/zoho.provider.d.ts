import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { ProviderCapabilities } from '../../types/standard-entities';
import { ZohoOAuthService } from './zoho.oauth';
import { ZohoApiService } from './zoho.api';
import { ZohoSyncHandler } from './zoho.sync-handler';
export declare class ZohoProvider implements IntegrationProvider {
    private prisma;
    private zohoOAuth;
    private zohoApi;
    private zohoSync;
    constructor(prisma: PrismaService, zohoOAuth: ZohoOAuthService, zohoApi: ZohoApiService, zohoSync: ZohoSyncHandler);
    getCapabilities(): ProviderCapabilities;
    getAuthUrl(tenantId: string, state?: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<void>;
    testConnection(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getStatus(tenantId: string): Promise<{
        connected: boolean;
        lastSyncAt: Date | null;
        failureCount24h: number;
        successCount24h: number;
        tokenValid: boolean;
        lastError: string | null;
    }>;
    syncCandidate(tenantId: string, candidateId: string, eventType: 'created' | 'updated' | 'stage_changed', data?: {
        newStage?: string;
    }): Promise<void>;
    syncInterview(tenantId: string, interviewId: string, eventType: 'scheduled' | 'completed'): Promise<void>;
    pushCandidate(tenantId: string, candidate: any): Promise<any>;
    pullCandidates(tenantId: string, since?: Date): Promise<any[]>;
    handleWebhook(tenantId: string, event: any): Promise<void>;
}
