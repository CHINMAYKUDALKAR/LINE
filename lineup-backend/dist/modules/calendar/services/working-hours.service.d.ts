import { PrismaService } from '../../../common/prisma.service';
import { SetWorkingHoursDto, WeeklyPatternDto } from '../dto';
import { AvailabilityService } from './availability.service';
export declare class WorkingHoursService {
    private prisma;
    private availabilityService;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService);
    getWorkingHours(tenantId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        timezone: string;
        weekly: import("@prisma/client/runtime/library").JsonValue;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
    } | null>;
    setWorkingHours(tenantId: string, currentUserId: string, currentUserRole: string, dto: SetWorkingHoursDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        timezone: string;
        weekly: import("@prisma/client/runtime/library").JsonValue;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
    }>;
    getDefaultPattern(timezone?: string): WeeklyPatternDto[];
    private validateWeeklyPattern;
}
