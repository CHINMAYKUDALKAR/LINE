import { PrismaService } from '../../../common/prisma.service';
import type { ReceiptJobData } from '../queues';
export declare class ReceiptController {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleWhatsAppWebhook(payload: any): Promise<any>;
    handleSesWebhook(payload: any): Promise<{
        success: boolean;
    }>;
    handleTwilioWebhook(payload: any): Promise<{
        success: boolean;
    }>;
    handleMockWebhook(payload: ReceiptJobData): Promise<{
        success: boolean;
        processed: string;
    }>;
    private updateMessageStatus;
    private mapWhatsAppStatus;
    private mapSesStatus;
    private mapTwilioStatus;
}
