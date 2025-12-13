import { IntegrationConnector } from '../../common/integration.interface';
import { TokenStoreService } from '../../common/token-store.service';
export declare class SalesforceService implements IntegrationConnector {
    private tokenStore;
    private readonly logger;
    provider: string;
    constructor(tokenStore: TokenStoreService);
    init(tenantId: string): Promise<void>;
    getAccessToken(tenantId: string): Promise<string>;
    refreshToken(tenantId: string): Promise<void>;
    pushRecord(tenantId: string, record: any): Promise<any>;
    pullChanges(tenantId: string, since?: string): Promise<any[]>;
    handleWebhook(tenantId: string, payload: any): Promise<any>;
}
