import { PrismaService } from '../../../common/prisma.service';
export interface CommunicationMetrics {
    messagesToday: number;
    successRate: number;
    failedCount: number;
    channelBreakdown: {
        email: number;
        whatsapp: number;
        sms: number;
    };
    topTemplates: {
        templateName: string;
        usageCount: number;
    }[];
    recentFailures: {
        id: string;
        channel: string;
        recipientEmail?: string;
        recipientPhone?: string;
        status: string;
        failedAt?: Date;
        metadata?: any;
    }[];
}
export declare class CommunicationMetricsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMetrics(): Promise<CommunicationMetrics>;
}
