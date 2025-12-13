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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../common/prisma.service");
const google_oauth_1 = require("./google.oauth");
const google_calendar_api_1 = require("./google.calendar.api");
let GoogleCalendarProvider = class GoogleCalendarProvider {
    prisma;
    googleOAuth;
    googleCalendar;
    constructor(prisma, googleOAuth, googleCalendar) {
        this.prisma = prisma;
        this.googleOAuth = googleOAuth;
        this.googleCalendar = googleCalendar;
    }
    async getAuthUrl(tenantId, state) {
        return this.googleOAuth.getAuthUrl(tenantId);
    }
    async exchangeCode(tenantId, code) {
        await this.googleOAuth.exchangeCode(tenantId, code);
    }
    async refreshTokens(tenantId) {
        await this.googleOAuth.refreshTokens(tenantId);
    }
    async createCalendarEvent(tenantId, interview) {
        const event = {
            summary: `Interview: ${interview.candidateName} - ${interview.role}`,
            description: `Interview with ${interview.candidateName} for ${interview.role}`,
            start: {
                dateTime: interview.date,
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(new Date(interview.date).getTime() + interview.durationMins * 60000).toISOString(),
                timeZone: 'UTC',
            },
            attendees: [
                { email: interview.candidateEmail },
                ...interview.interviewerEmails.map((email) => ({ email })),
            ],
            conferenceData: {
                createRequest: {
                    requestId: interview.id,
                },
            },
        };
        return this.googleCalendar.createEvent(tenantId, event);
    }
    async updateCalendarEvent(tenantId, interview) {
        const event = {
            summary: `Interview: ${interview.candidateName} - ${interview.role}`,
            start: {
                dateTime: interview.date,
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(new Date(interview.date).getTime() + interview.durationMins * 60000).toISOString(),
                timeZone: 'UTC',
            },
        };
        return this.googleCalendar.updateEvent(tenantId, interview.calendarEventId, event);
    }
    async deleteCalendarEvent(tenantId, interviewId) {
        await this.googleCalendar.deleteEvent(tenantId, interviewId);
    }
    async handleWebhook(tenantId, event) {
        console.log(`Google Calendar webhook for tenant ${tenantId}`, event);
    }
};
exports.GoogleCalendarProvider = GoogleCalendarProvider;
exports.GoogleCalendarProvider = GoogleCalendarProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        google_oauth_1.GoogleOAuthService,
        google_calendar_api_1.GoogleCalendarApiService])
], GoogleCalendarProvider);
//# sourceMappingURL=google.provider.js.map