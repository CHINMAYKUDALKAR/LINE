import { PrismaService } from '../../common/prisma.service';
export declare class RecycleBinService {
    private prisma;
    constructor(prisma: PrismaService);
    private getRetentionDays;
    softDelete(tenantId: string, userId: string, module: string, itemId: string, itemSnapshot: any): Promise<{
        id: string;
        tenantId: string;
        expiresAt: Date | null;
        module: string;
        itemId: string;
        itemSnapshot: import("@prisma/client/runtime/library").JsonValue;
        deletedBy: string;
        deletedAt: Date;
        restoredAt: Date | null;
        purgedAt: Date | null;
    }>;
    findAll(tenantId: string, userId: string, userRole: string, filters?: {
        module?: string;
        from?: string;
        to?: string;
        deletedBy?: string;
        page?: number;
        perPage?: number;
    }): Promise<{
        data: {
            id: string;
            tenantId: string;
            expiresAt: Date | null;
            module: string;
            itemId: string;
            itemSnapshot: import("@prisma/client/runtime/library").JsonValue;
            deletedBy: string;
            deletedAt: Date;
            restoredAt: Date | null;
            purgedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getStats(tenantId: string, userId: string, userRole: string): Promise<{
        total: number;
        byModule: {
            module: string;
            count: number;
        }[];
    }>;
    findOne(tenantId: string, userId: string, userRole: string, id: string): Promise<{
        id: string;
        tenantId: string;
        expiresAt: Date | null;
        module: string;
        itemId: string;
        itemSnapshot: import("@prisma/client/runtime/library").JsonValue;
        deletedBy: string;
        deletedAt: Date;
        restoredAt: Date | null;
        purgedAt: Date | null;
    }>;
    restore(tenantId: string, userId: string, userRole: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    purge(tenantId: string, userId: string, userRole: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
