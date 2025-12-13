import { PrismaService } from '../../../common/prisma.service';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';
export declare class ZohoSyncService {
    private prisma;
    private oauth;
    private fieldmap;
    private zohoApi;
    constructor(prisma: PrismaService, oauth: ZohoOAuthService, fieldmap: ZohoFieldMapService);
    syncLeads(tenantId: string): Promise<{
        imported: any;
    }>;
    syncContacts(tenantId: string): Promise<{
        imported: any;
    }>;
    applyMapping(record: any, mapping: Record<string, string>): any;
}
