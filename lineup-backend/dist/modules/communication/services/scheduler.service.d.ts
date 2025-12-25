import { PrismaService } from '../../../common/prisma.service';
import { MessageService } from './message.service';
export declare class SchedulerService {
    private prisma;
    private messageService;
    private readonly logger;
    constructor(prisma: PrismaService, messageService: MessageService);
    processDueMessages(): Promise<{
        processed: number;
        failed: number;
    }>;
    getUpcoming(tenantId: string, limit?: number): Promise<{
        jobId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.ScheduleStatus;
        createdById: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        jobId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import("@prisma/client").$Enums.ScheduleStatus;
        createdById: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue;
        channel: import("@prisma/client").$Enums.Channel;
        recipientType: import("@prisma/client").$Enums.RecipientType;
        recipientId: string;
        templateId: string | null;
        scheduledFor: Date;
    } | null>;
}
