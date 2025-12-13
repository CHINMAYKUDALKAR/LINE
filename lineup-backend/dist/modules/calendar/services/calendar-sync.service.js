"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CalendarSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const google_calendar_oauth_service_1 = require("./google-calendar-oauth.service");
const microsoft_calendar_oauth_service_1 = require("./microsoft-calendar-oauth.service");
const busy_block_service_1 = require("./busy-block.service");
const axios_1 = __importDefault(require("axios"));
let CalendarSyncService = CalendarSyncService_1 = class CalendarSyncService {
    prisma;
    googleOAuth;
    microsoftOAuth;
    busyBlockService;
    logger = new common_1.Logger(CalendarSyncService_1.name);
    constructor(prisma, googleOAuth, microsoftOAuth, busyBlockService) {
        this.prisma = prisma;
        this.googleOAuth = googleOAuth;
        this.microsoftOAuth = microsoftOAuth;
        this.busyBlockService = busyBlockService;
    }
    async syncCalendar(accountId) {
        const account = await this.prisma.calendarSyncAccount.findUnique({
            where: { id: accountId },
        });
        if (!account || !account.syncEnabled) {
            this.logger.warn(`Sync skipped for account ${accountId}: not found or disabled`);
            return { eventsProcessed: 0 };
        }
        const now = new Date();
        const startDate = now;
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);
        let events = [];
        try {
            if (account.provider === 'google') {
                events = await this.fetchGoogleEvents(account, startDate, endDate);
            }
            else if (account.provider === 'microsoft') {
                events = await this.fetchMicrosoftEvents(account, startDate, endDate);
            }
            await this.createBusyBlocksFromEvents(account.tenantId, account.userId, events, account.provider);
            await this.prisma.calendarSyncAccount.update({
                where: { id: accountId },
                data: { lastSyncAt: new Date() },
            });
            this.logger.log(`Synced ${events.length} events for account ${accountId}`);
            return { eventsProcessed: events.length };
        }
        catch (error) {
            this.logger.error(`Failed to sync calendar ${accountId}: ${error.message}`);
            throw error;
        }
    }
    async fetchGoogleEvents(account, startDate, endDate) {
        const accessToken = await this.googleOAuth.getValidAccessToken(account.id);
        const params = new URLSearchParams({
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '250',
        });
        const response = await axios_1.default.get(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        return (response.data.items || [])
            .filter((event) => event.status !== 'cancelled')
            .map((event) => this.parseGoogleEvent(event));
    }
    parseGoogleEvent(event) {
        const start = event.start?.dateTime
            ? new Date(event.start.dateTime)
            : new Date(event.start?.date || new Date());
        const end = event.end?.dateTime
            ? new Date(event.end.dateTime)
            : new Date(event.end?.date || new Date());
        return {
            id: event.id,
            title: event.summary || 'Busy',
            start,
            end,
            isAllDay: !event.start?.dateTime,
            status: event.status,
        };
    }
    async fetchMicrosoftEvents(account, startDate, endDate) {
        const accessToken = await this.microsoftOAuth.getValidAccessToken(account.id);
        const response = await axios_1.default.get(`https://graph.microsoft.com/v1.0/me/calendarview`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                $top: 250,
                $orderby: 'start/dateTime',
            },
        });
        return (response.data.value || [])
            .filter((event) => event.showAs !== 'free')
            .map((event) => this.parseMicrosoftEvent(event));
    }
    parseMicrosoftEvent(event) {
        const start = new Date(event.start?.dateTime || new Date());
        const end = new Date(event.end?.dateTime || new Date());
        return {
            id: event.id,
            title: event.subject || 'Busy',
            start,
            end,
            isAllDay: event.isAllDay,
            status: event.showAs,
        };
    }
    async createBusyBlocksFromEvents(tenantId, userId, events, provider) {
        await this.prisma.busyBlock.deleteMany({
            where: {
                tenantId,
                userId,
                source: 'calendar_sync',
                metadata: {
                    path: ['provider'],
                    equals: provider,
                },
            },
        });
        for (const event of events) {
            if (event.isAllDay)
                continue;
            await this.prisma.busyBlock.create({
                data: {
                    tenantId,
                    userId,
                    startAt: event.start,
                    endAt: event.end,
                    reason: event.title,
                    source: 'calendar_sync',
                    sourceId: event.id,
                    metadata: {
                        provider,
                        originalTitle: event.title,
                        syncedAt: new Date().toISOString(),
                    },
                },
            });
        }
    }
    async getConnectedAccounts(tenantId, userId) {
        const accounts = await this.prisma.calendarSyncAccount.findMany({
            where: { tenantId, userId },
            select: {
                id: true,
                provider: true,
                providerAccountId: true,
                syncEnabled: true,
                lastSyncAt: true,
            },
        });
        return accounts;
    }
    async toggleSyncEnabled(accountId, enabled) {
        await this.prisma.calendarSyncAccount.update({
            where: { id: accountId },
            data: { syncEnabled: enabled },
        });
    }
    async syncTenantCalendars(tenantId) {
        const accounts = await this.prisma.calendarSyncAccount.findMany({
            where: { tenantId, syncEnabled: true },
        });
        let totalEvents = 0;
        for (const account of accounts) {
            try {
                const result = await this.syncCalendar(account.id);
                totalEvents += result.eventsProcessed;
            }
            catch (error) {
                this.logger.error(`Failed to sync account ${account.id}: ${error.message}`);
            }
        }
        return { totalEvents, accounts: accounts.length };
    }
};
exports.CalendarSyncService = CalendarSyncService;
exports.CalendarSyncService = CalendarSyncService = CalendarSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        google_calendar_oauth_service_1.GoogleCalendarOAuthService,
        microsoft_calendar_oauth_service_1.MicrosoftCalendarOAuthService,
        busy_block_service_1.BusyBlockService])
], CalendarSyncService);
//# sourceMappingURL=calendar-sync.service.js.map