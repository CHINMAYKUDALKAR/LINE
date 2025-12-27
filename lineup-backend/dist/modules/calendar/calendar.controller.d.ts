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
    getInterviewerAvailability(req: any, userId: string, start: string, end: string, durationMins?: string): Promise<{
        calendarSyncError?: string | undefined;
        userId: string;
        freeSlots: {
            start: Date;
            end: Date;
            durationMins: number;
        }[];
        busySlots: ({
            start: Date;
            end: Date;
            source: "google" | "microsoft";
            reason?: string;
        } | {
            start: any;
            end: any;
            source: any;
            reason: any;
        })[];
        calendarConnected: boolean;
        connectedCalendars: {
            provider: string;
            syncEnabled: boolean;
            lastSyncAt: Date | null;
        }[];
    }>;
    getSuggestions(req: any, dto: SuggestionQueryDto): Promise<import("./dto").SuggestionResponseDto>;
    getTeamAvailability(req: any, query: TeamAvailabilityQueryDto): Promise<import("./dto").TeamAvailabilityResponseDto>;
    getSlots(req: any, query: SlotQueryDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            tenantId: string;
            status: import("@prisma/client").$Enums.SlotStatus;
            timezone: string;
            interviewId: string | null;
            startAt: Date;
            endAt: Date;
            organizerId: string | null;
            participants: import("@prisma/client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    }>;
    getSlot(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.SlotStatus;
        timezone: string;
        interviewId: string | null;
        startAt: Date;
        endAt: Date;
        organizerId: string | null;
        participants: import("@prisma/client/runtime/library").JsonValue;
    }>;
    createSlot(req: any, dto: CreateSlotDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.SlotStatus;
        timezone: string;
        interviewId: string | null;
        startAt: Date;
        endAt: Date;
        organizerId: string | null;
        participants: import("@prisma/client/runtime/library").JsonValue;
    } | {
        warning: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.SlotStatus;
        timezone: string;
        interviewId: string | null;
        startAt: Date;
        endAt: Date;
        organizerId: string | null;
        participants: import("@prisma/client/runtime/library").JsonValue;
    }>;
    generateSlots(req: any, dto: GenerateSlotsDto): Promise<{
        created: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            tenantId: string;
            status: import("@prisma/client").$Enums.SlotStatus;
            timezone: string;
            interviewId: string | null;
            startAt: Date;
            endAt: Date;
            organizerId: string | null;
            participants: import("@prisma/client/runtime/library").JsonValue;
        }[];
        total: number;
        limited: boolean;
    }>;
    bookSlot(req: any, id: string, dto: BookSlotDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.SlotStatus;
        timezone: string;
        interviewId: string | null;
        startAt: Date;
        endAt: Date;
        organizerId: string | null;
        participants: import("@prisma/client/runtime/library").JsonValue;
    }>;
    rescheduleSlot(req: any, id: string, dto: RescheduleSlotDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.SlotStatus;
        timezone: string;
        interviewId: string | null;
        startAt: Date;
        endAt: Date;
        organizerId: string | null;
        participants: import("@prisma/client/runtime/library").JsonValue;
    }>;
    cancelSlot(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        status: import("@prisma/client").$Enums.SlotStatus;
        timezone: string;
        interviewId: string | null;
        startAt: Date;
        endAt: Date;
        organizerId: string | null;
        participants: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getWorkingHours(req: any, userId?: string): Promise<{
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
    setWorkingHours(req: any, dto: SetWorkingHoursDto): Promise<{
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
    getBusyBlocks(req: any, query: BusyBlockQueryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        sourceId: string | null;
        startAt: Date;
        endAt: Date;
    }[]>;
    createBusyBlock(req: any, dto: CreateBusyBlockDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        sourceId: string | null;
        startAt: Date;
        endAt: Date;
    }>;
    deleteBusyBlock(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        tenantId: string;
        userId: string;
        source: string;
        reason: string | null;
        sourceId: string | null;
        startAt: Date;
        endAt: Date;
    }>;
    getRules(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdBy: string | null;
        isDefault: boolean;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
    }[]>;
    getRule(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdBy: string | null;
        isDefault: boolean;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
    }>;
    createRule(req: any, dto: CreateSchedulingRuleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdBy: string | null;
        isDefault: boolean;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
    }>;
    updateRule(req: any, id: string, dto: UpdateSchedulingRuleDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdBy: string | null;
        isDefault: boolean;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
    }>;
    deleteRule(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        createdBy: string | null;
        isDefault: boolean;
        minNoticeMins: number;
        bufferBeforeMins: number;
        bufferAfterMins: number;
        defaultSlotMins: number;
        allowOverlapping: boolean;
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
