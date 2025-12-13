import { PrismaService } from '../../../common/prisma.service';
import { WorkingHoursService } from './working-hours.service';
import { BusyBlockService } from './busy-block.service';
import { SchedulingRulesService } from './scheduling-rules.service';
import { TimeInterval, MultiUserAvailabilityResult } from '../types/calendar.types';
export declare class AvailabilityService {
    private prisma;
    private workingHoursService;
    private busyBlockService;
    private schedulingRulesService;
    private readonly logger;
    constructor(prisma: PrismaService, workingHoursService: WorkingHoursService, busyBlockService: BusyBlockService, schedulingRulesService: SchedulingRulesService);
    private getFreeIntervalsCacheKey;
    private getBusyBlocksCacheKey;
    invalidateUserCache(tenantId: string, userId: string): Promise<void>;
    invalidateTenantCache(tenantId: string): Promise<void>;
    getFreeIntervals(tenantId: string, userId: string, start: Date, end: Date): Promise<TimeInterval[]>;
    private computeFreeIntervals;
    private getCachedBusyBlocks;
    getMultiUserAvailability(tenantId: string, userIds: string[], start: Date, end: Date, durationMins: number, ruleId?: string): Promise<MultiUserAvailabilityResult>;
    private expandWeeklyPattern;
    isSlotAvailable(tenantId: string, userIds: string[], start: Date, end: Date): Promise<boolean>;
}
