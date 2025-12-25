import { Queue } from 'bullmq';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoSyncService } from './zoho.sync.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';
import { ZohoWebhookService } from './zoho.webhook.service';
import { ZohoAuthDto } from './dto/zoho-auth.dto';
import { ZohoFieldMapDto } from './dto/zoho-fieldmap.dto';
import { PrismaService } from '../../../common/prisma.service';
export declare class ZohoController {
    private oauth;
    private sync;
    private fieldmap;
    private webhook;
    private prisma;
    private syncQueue;
    private readonly logger;
    private syncRateLimits;
    constructor(oauth: ZohoOAuthService, sync: ZohoSyncService, fieldmap: ZohoFieldMapService, webhook: ZohoWebhookService, prisma: PrismaService, syncQueue: Queue);
    getAuthUrl(req: any, redirectUri: string): string;
    exchangeCode(req: any, dto: ZohoAuthDto): Promise<{
        success: boolean;
    }>;
    requestSync(req: any, module: string): Promise<import("bullmq").Job<any, any, string>>;
    saveFieldMap(req: any, dto: ZohoFieldMapDto): Promise<void>;
    zohoWebhook(tenantId: string, body: any): Promise<{
        success: boolean;
    }>;
}
