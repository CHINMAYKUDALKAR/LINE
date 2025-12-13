import { AvailabilityService, BusyBlockService, CalendarSyncService, GoogleCalendarOAuthService, MicrosoftCalendarOAuthService, SchedulingRulesService, SlotService, SuggestionService, WorkingHoursService } from './services';
import { AvailabilityQueryDto, CalendarCallbackDto, CalendarConnectDto, ToggleSyncDto, CreateBusyBlockDto, BusyBlockQueryDto, CreateSchedulingRuleDto, UpdateSchedulingRuleDto, CreateSlotDto, GenerateSlotsDto, BookSlotDto, RescheduleSlotDto, SlotQueryDto, SetWorkingHoursDto, SuggestionQueryDto, TeamAvailabilityQueryDto } from './dto';
export declare class CalendarController {
    private availabilityService;
    private busyBlockService;
    private calendarSyncService;
    private googleOAuth;
    private microsoftOAuth;
    private schedulingRulesService;
    private slotService;
    private suggestionService;
    private workingHoursService;
    constructor(availabilityService: AvailabilityService, busyBlockService: BusyBlockService, calendarSyncService: CalendarSyncService, googleOAuth: GoogleCalendarOAuthService, microsoftOAuth: MicrosoftCalendarOAuthService, schedulingRulesService: SchedulingRulesService, slotService: SlotService, suggestionService: SuggestionService, workingHoursService: WorkingHoursService);
    getAvailability(req: any, query: AvailabilityQueryDto): Promise<import("./types/calendar.types").MultiUserAvailabilityResult>;
    getSuggestions(req: any, dto: SuggestionQueryDto): Promise<import("./dto").SuggestionResponseDto>;
    getTeamAvailability(req: any, query: TeamAvailabilityQueryDto): Promise<import("./dto").TeamAvailabilityResponseDto>;
    getSlots(req: any, query: SlotQueryDto): Promise<{
        items: {
            id: string;
            tenantId: string;
            interviewId: string | null;
            organizerId: string | null;
            participants: import(".prisma/client").Prisma.JsonValue;
            startAt: Date;
            endAt: Date;
            timezone: string;
            status: import(".prisma/client").$Enums.SlotStatus;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    getSlot(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        interviewId: string | null;
        organizerId: string | null;
        participants: import(".prisma/client").Prisma.JsonValue;
        startAt: Date;
        endAt: Date;
        timezone: string;
        status: import(".prisma/client").$Enums.SlotStatus;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createSlot(req: any, dto: CreateSlotDto): Promise<{
        id: string;
        tenantId: string;
        interviewId: string | null;
        organizerId: string | null;
        participants: import(".prisma/client").Prisma.JsonValue;
        startAt: Date;
        endAt: Date;
        timezone: string;
        status: import(".prisma/client").$Enums.SlotStatus;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateSlots(req: any, dto: GenerateSlotsDto): Promise<{
        id: string;
        tenantId: string;
        interviewId: string | null;
        organizerId: string | null;
        participants: import(".prisma/client").Prisma.JsonValue;
        startAt: Date;
        endAt: Date;
        timezone: string;
        status: import(".prisma/client").$Enums.SlotStatus;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    bookSlot(req: any, id: string, dto: BookSlotDto): Promise<{
        id: string;
        tenantId: string;
        interviewId: string | null;
        organizerId: string | null;
        participants: import(".prisma/client").Prisma.JsonValue;
        startAt: Date;
        endAt: Date;
        timezone: string;
        status: import(".prisma/client").$Enums.SlotStatus;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    rescheduleSlot(req: any, id: string, dto: RescheduleSlotDto): Promise<{
        id: string;
        tenantId: string;
        interviewId: string | null;
        organizerId: string | null;
        participants: import(".prisma/client").Prisma.JsonValue;
        startAt: Date;
        endAt: Date;
        timezone: string;
        status: import(".prisma/client").$Enums.SlotStatus;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cancelSlot(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        interviewId: string | null;
        organizerId: string | null;
        participants: import(".prisma/client").Prisma.JsonValue;
        startAt: Date;
        endAt: Date;
        timezone: string;
        status: import(".prisma/client").$Enums.SlotStatus;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getWorkingHours(req: any, userId?: string): Promise<{
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
    setWorkingHours(req: any, dto: SetWorkingHoursDto): Promise<{
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
    getBusyBlocks(req: any, query: BusyBlockQueryDto): Promise<{
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
    createBusyBlock(req: any, dto: CreateBusyBlockDto): Promise<{
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
    deleteBusyBlock(req: any, id: string): Promise<{
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
    getRules(req: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
        isDefault: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRule(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
        isDefault: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createRule(req: any, dto: CreateSchedulingRuleDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
        isDefault: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRule(req: any, id: string, dto: UpdateSchedulingRuleDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
        isDefault: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteRule(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
        isDefault: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getConnectedAccounts(req: any): Promise<{
        accounts: {
            id: string;
            provider: string;
            providerAccountId: string;
            syncEnabled: boolean;
            lastSyncAt: Date | null;
        }[];
    }>;
    getGoogleAuthUrl(req: any, dto: CalendarConnectDto): Promise<{
        authUrl: string;
    }>;
    googleCallback(req: any, dto: CalendarCallbackDto): Promise<{
        success: boolean;
        accountId: string;
    }>;
    disconnectGoogle(req: any): Promise<{
        success: boolean;
    }>;
    getMicrosoftAuthUrl(req: any, dto: CalendarConnectDto): Promise<{
        authUrl: string;
    }>;
    microsoftCallback(req: any, dto: CalendarCallbackDto): Promise<{
        success: boolean;
        accountId: string;
    }>;
    disconnectMicrosoft(req: any): Promise<{
        success: boolean;
    }>;
    syncCalendar(accountId: string): Promise<{
        success: boolean;
        eventsProcessed: number;
    }>;
    toggleSync(accountId: string, dto: ToggleSyncDto): Promise<{
        success: boolean;
    }>;
}
