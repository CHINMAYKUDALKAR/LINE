import { PrismaService } from '../../../common/prisma.service';
import { SetWorkingHoursDto, WeeklyPatternDto } from '../dto';
import { AvailabilityService } from './availability.service';
export declare class WorkingHoursService {
    private prisma;
    private availabilityService;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService);
    getWorkingHours(tenantId: string, userId: string): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        weekly: import(".prisma/client").Prisma.JsonValue;
        timezone: string;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    setWorkingHours(tenantId: string, currentUserId: string, dto: SetWorkingHoursDto): Promise<{
        id: string;
        tenantId: string;
        userId: string;
        weekly: import(".prisma/client").Prisma.JsonValue;
        timezone: string;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDefaultPattern(timezone?: string): WeeklyPatternDto[];
    private validateWeeklyPattern;
}
