import { PrismaService } from '../../../common/prisma.service';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { MicrosoftCalendarOAuthService } from './microsoft-calendar-oauth.service';
import { BusyBlockService } from './busy-block.service';
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    isAllDay?: boolean;
    status?: string;
}
export declare class CalendarSyncService {
    private prisma;
    private googleOAuth;
    private microsoftOAuth;
    private busyBlockService;
    private readonly logger;
    constructor(prisma: PrismaService, googleOAuth: GoogleCalendarOAuthService, microsoftOAuth: MicrosoftCalendarOAuthService, busyBlockService: BusyBlockService);
    syncCalendar(accountId: string): Promise<{
        eventsProcessed: number;
    }>;
    private fetchGoogleEvents;
    private parseGoogleEvent;
    private fetchMicrosoftEvents;
    private parseMicrosoftEvent;
    private createBusyBlocksFromEvents;
    getConnectedAccounts(tenantId: string, userId: string): Promise<Array<{
        id: string;
        provider: string;
        providerAccountId: string;
        syncEnabled: boolean;
        lastSyncAt: Date | null;
    }>>;
    toggleSyncEnabled(accountId: string, enabled: boolean): Promise<void>;
    syncTenantCalendars(tenantId: string): Promise<{
        totalEvents: number;
        accounts: number;
    }>;
}
