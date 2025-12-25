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
var GoogleCalendarOAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarOAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const axios_1 = __importDefault(require("axios"));
let GoogleCalendarOAuthService = GoogleCalendarOAuthService_1 = class GoogleCalendarOAuthService {
    prisma;
    logger = new common_1.Logger(GoogleCalendarOAuthService_1.name);
    clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    tokenUrl = 'https://oauth2.googleapis.com/token';
    scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
    ].join(' ');
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAuthUrl(tenantId, userId, redirectUri) {
        const state = Buffer.from(JSON.stringify({ tenantId, userId })).toString('base64');
        const params = new URLSearchParams({
            client_id: this.clientId || '',
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: this.scopes,
            access_type: 'offline',
            prompt: 'consent',
            state,
        });
        return `${this.authUrl}?${params.toString()}`;
    }
    async exchangeCode(tenantId, userId, code, redirectUri) {
        const params = new URLSearchParams({
            code,
            client_id: this.clientId || '',
            client_secret: this.clientSecret || '',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });
        try {
            const res = await axios_1.default.post(this.tokenUrl, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            if (!res.data.access_token) {
                throw new common_1.BadRequestException('Invalid authorization code');
            }
            const tokens = {
                ...res.data,
                expires_at: Date.now() + res.data.expires_in * 1000,
            };
            const userInfo = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            const account = await this.prisma.calendarSyncAccount.upsert({
                where: {
                    tenantId_userId_provider: { tenantId, userId, provider: 'google' },
                },
                create: {
                    tenantId,
                    userId,
                    provider: 'google',
                    providerAccountId: userInfo.data.id || userInfo.data.email,
                    credentials: tokens,
                    syncEnabled: true,
                },
                update: {
                    providerAccountId: userInfo.data.id || userInfo.data.email,
                    credentials: tokens,
                    syncEnabled: true,
                },
            });
            this.logger.log(`Connected Google Calendar for user ${userId} in tenant ${tenantId}`);
            return { success: true, accountId: account.id };
        }
        catch (error) {
            this.logger.error(`Failed to exchange Google OAuth code: ${error.message}`);
            throw new common_1.BadRequestException('Failed to connect Google Calendar');
        }
    }
    async refreshAccessToken(accountId) {
        const account = await this.prisma.calendarSyncAccount.findUnique({
            where: { id: accountId },
        });
        if (!account || account.provider !== 'google') {
            throw new common_1.BadRequestException('Google Calendar account not found');
        }
        const tokens = account.credentials;
        if (!tokens?.refresh_token) {
            throw new common_1.BadRequestException('No refresh token available');
        }
        const params = new URLSearchParams({
            client_id: this.clientId || '',
            client_secret: this.clientSecret || '',
            refresh_token: tokens.refresh_token,
            grant_type: 'refresh_token',
        });
        try {
            const res = await axios_1.default.post(this.tokenUrl, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const newTokens = {
                ...tokens,
                access_token: res.data.access_token,
                expires_in: res.data.expires_in,
                expires_at: Date.now() + res.data.expires_in * 1000,
            };
            await this.prisma.calendarSyncAccount.update({
                where: { id: accountId },
                data: { credentials: newTokens },
            });
            return newTokens.access_token;
        }
        catch (error) {
            this.logger.error(`Failed to refresh Google token: ${error.message}`);
            throw new common_1.BadRequestException('Failed to refresh Google Calendar token');
        }
    }
    async getValidAccessToken(accountId) {
        const account = await this.prisma.calendarSyncAccount.findUnique({
            where: { id: accountId },
        });
        if (!account || account.provider !== 'google') {
            throw new common_1.BadRequestException('Google Calendar account not found');
        }
        const tokens = account.credentials;
        if (!tokens?.access_token) {
            throw new common_1.BadRequestException('No access token available');
        }
        const expiresAt = tokens.expires_at || 0;
        if (expiresAt - Date.now() < 5 * 60 * 1000) {
            return this.refreshAccessToken(accountId);
        }
        return tokens.access_token;
    }
    async disconnect(tenantId, userId) {
        await this.prisma.calendarSyncAccount.deleteMany({
            where: { tenantId, userId, provider: 'google' },
        });
        this.logger.log(`Disconnected Google Calendar for user ${userId} in tenant ${tenantId}`);
    }
    async getBusySlots(accountId, from, to) {
        try {
            const accessToken = await this.getValidAccessToken(accountId);
            const response = await axios_1.default.post('https://www.googleapis.com/calendar/v3/freeBusy', {
                timeMin: from.toISOString(),
                timeMax: to.toISOString(),
                items: [{ id: 'primary' }],
            }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const busySlots = [];
            const calendars = response.data.calendars || {};
            const primaryBusy = calendars.primary?.busy || [];
            for (const period of primaryBusy) {
                busySlots.push({
                    start: new Date(period.start),
                    end: new Date(period.end),
                    source: 'google',
                    reason: 'Google Calendar: Busy',
                });
            }
            this.logger.debug(`Fetched ${busySlots.length} busy slots from Google Calendar for account ${accountId}`);
            return { busySlots, success: true };
        }
        catch (error) {
            this.logger.warn(`Failed to fetch Google Calendar busy slots for account ${accountId}: ${error.message}`);
            return {
                busySlots: [],
                success: false,
                error: error.message || 'Failed to fetch Google Calendar availability',
            };
        }
    }
    async isTokenExpired(accountId) {
        try {
            const account = await this.prisma.calendarSyncAccount.findUnique({
                where: { id: accountId },
            });
            if (!account)
                return true;
            const tokens = account.credentials;
            const expiresAt = tokens?.expires_at || 0;
            return expiresAt - Date.now() < 5 * 60 * 1000;
        }
        catch {
            return true;
        }
    }
};
exports.GoogleCalendarOAuthService = GoogleCalendarOAuthService;
exports.GoogleCalendarOAuthService = GoogleCalendarOAuthService = GoogleCalendarOAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoogleCalendarOAuthService);
//# sourceMappingURL=google-calendar-oauth.service.js.map