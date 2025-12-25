import { PrismaService } from '../../../common/prisma.service';
import { CreateBusyBlockDto, BusyBlockQueryDto } from '../dto';
import { AvailabilityService } from './availability.service';
export declare class BusyBlockService {
    private prisma;
    private availabilityService;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService);
    getBusyBlocks(tenantId: string, query: BusyBlockQueryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        startAt: Date;
        sourceId: string | null;
        endAt: Date;
    }[]>;
    createBusyBlock(tenantId: string, currentUserId: string, dto: CreateBusyBlockDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        startAt: Date;
        sourceId: string | null;
        endAt: Date;
    }>;
    createFromInterview(tenantId: string, userId: string, interviewId: string, startAt: Date, endAt: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        startAt: Date;
        sourceId: string | null;
        endAt: Date;
    }>;
    deleteBusyBlock(tenantId: string, currentUserId: string, blockId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        startAt: Date;
        sourceId: string | null;
        endAt: Date;
    }>;
    deleteBySourceId(tenantId: string, sourceId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
