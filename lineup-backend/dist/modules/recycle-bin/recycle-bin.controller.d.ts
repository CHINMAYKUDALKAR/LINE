import { RecycleBinService } from './recycle-bin.service';
import { ListRecycleBinDto } from './dto/list-recycle-bin.dto';
export declare class RecycleBinController {
    private readonly recycleBinService;
    constructor(recycleBinService: RecycleBinService);
    list(req: any, dto: ListRecycleBinDto): Promise<{
        data: {
            id: string;
            tenantId: string;
            module: string;
            itemId: string;
            itemSnapshot: import(".prisma/client").Prisma.JsonValue;
            deletedBy: string;
            deletedAt: Date;
            restoredAt: Date | null;
            purgedAt: Date | null;
            expiresAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getStats(req: any): Promise<{
        total: number;
        byModule: {
            module: string;
            count: number;
        }[];
    }>;
    findOne(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        module: string;
        itemId: string;
        itemSnapshot: import(".prisma/client").Prisma.JsonValue;
        deletedBy: string;
        deletedAt: Date;
        restoredAt: Date | null;
        purgedAt: Date | null;
        expiresAt: Date | null;
    }>;
    restore(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    purge(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
