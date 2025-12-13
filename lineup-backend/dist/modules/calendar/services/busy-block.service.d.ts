import { PrismaService } from '../../../common/prisma.service';
import { CreateBusyBlockDto, BusyBlockQueryDto } from '../dto';
import { AvailabilityService } from './availability.service';
export declare class BusyBlockService {
    private prisma;
    private availabilityService;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService);
    getBusyBlocks(tenantId: string, query: BusyBlockQueryDto): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        startAt: Date;
        endAt: Date;
        reason: string | null;
        source: string;
        sourceId: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createBusyBlock(tenantId: string, currentUserId: string, dto: CreateBusyBlockDto): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        startAt: Date;
        endAt: Date;
        reason: string | null;
        source: string;
        sourceId: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createFromInterview(tenantId: string, userId: string, interviewId: string, startAt: Date, endAt: Date): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        startAt: Date;
        endAt: Date;
        reason: string | null;
        source: string;
        sourceId: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteBusyBlock(tenantId: string, currentUserId: string, blockId: string): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        startAt: Date;
        endAt: Date;
        reason: string | null;
        source: string;
        sourceId: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteBySourceId(tenantId: string, sourceId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
