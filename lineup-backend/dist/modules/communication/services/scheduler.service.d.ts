import { PrismaService } from '../../../common/prisma.service';
import { MessageService } from './message.service';
export declare class SchedulerService {
    private prisma;
    private messageService;
    constructor(prisma: PrismaService, messageService: MessageService);
    processDueMessages(): Promise<{
        processed: number;
        failed: number;
    }>;
    getUpcoming(tenantId: string, limit?: number): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        scheduledFor: Date;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        jobId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        templateId: string | null;
        recipientType: import(".prisma/client").$Enums.RecipientType;
        recipientId: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        scheduledFor: Date;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        jobId: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
