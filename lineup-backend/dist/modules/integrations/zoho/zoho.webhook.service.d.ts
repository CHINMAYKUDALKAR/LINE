import { PrismaService } from '../../../common/prisma.service';
export declare class ZohoWebhookService {
    private prisma;
    constructor(prisma: PrismaService);
    handleWebhook(tenantId: string, body: any): Promise<{
        success: boolean;
    }>;
}
