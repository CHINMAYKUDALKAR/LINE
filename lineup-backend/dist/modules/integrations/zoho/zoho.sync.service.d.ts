import { PrismaService } from '../../../common/prisma.service';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';
export declare class ZohoSyncService {
    private prisma;
    private oauth;
    private fieldmap;
    private readonly logger;
    private zohoApi;
    constructor(prisma: PrismaService, oauth: ZohoOAuthService, fieldmap: ZohoFieldMapService);
    syncLeads(tenantId: string): Promise<{
        imported: number;
        updated: number;
        errors: number;
        total: any;
    }>;
    syncContacts(tenantId: string): Promise<{
        imported: number;
        updated: number;
        errors: number;
        total: any;
    }>;
    applyMapping(record: any, mapping: Record<string, string>): any;
    mapZohoStatusToStage(zohoStatus: string): string;
    syncStages(tenantId: string): Promise<{
        imported: number;
        updated: number;
        total: any;
    }>;
    private getStageColor;
    syncUsers(tenantId: string): Promise<{
        imported: number;
        updated: number;
        errors: number;
        total: any;
    }>;
    private mapZohoRoleToLineup;
    syncAll(tenantId: string, module?: string): Promise<any>;
}
