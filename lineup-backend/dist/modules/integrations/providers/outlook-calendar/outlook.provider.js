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
exports.OutlookCalendarProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../common/prisma.service");
const outlook_oauth_1 = require("./outlook.oauth");
const outlook_api_1 = require("./outlook.api");
let OutlookCalendarProvider = class OutlookCalendarProvider {
    prisma;
    outlookOAuth;
    outlookCalendar;
    constructor(prisma, outlookOAuth, outlookCalendar) {
        this.prisma = prisma;
        this.outlookOAuth = outlookOAuth;
        this.outlookCalendar = outlookCalendar;
    }
    async getAuthUrl(tenantId, state) {
        return this.outlookOAuth.getAuthUrl(tenantId);
    }
    async exchangeCode(tenantId, code) {
        await this.outlookOAuth.exchangeCode(tenantId, code);
    }
    async refreshTokens(tenantId) {
        await this.outlookOAuth.refreshTokens(tenantId);
    }
    async createCalendarEvent(tenantId, interview) {
        const event = {
            subject: `Interview: ${interview.candidateName} - ${interview.role}`,
            body: {
                contentType: 'HTML',
                content: `Interview with ${interview.candidateName} for ${interview.role}`,
            },
            start: {
                dateTime: interview.date,
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(new Date(interview.date).getTime() + interview.durationMins * 60000).toISOString(),
                timeZone: 'UTC',
            },
            attendees: [
                {
                    emailAddress: { address: interview.candidateEmail },
                    type: 'required',
                },
                ...interview.interviewerEmails.map((email) => ({
                    emailAddress: { address: email },
                    type: 'required',
                })),
            ],
            isOnlineMeeting: true,
            onlineMeetingProvider: 'teamsForBusiness',
        };
        return this.outlookCalendar.createEvent(tenantId, event);
    }
    async updateCalendarEvent(tenantId, interview) {
        const event = {
            subject: `Interview: ${interview.candidateName} - ${interview.role}`,
            start: {
                dateTime: interview.date,
                timeZone: 'UTC',
            },
            end: {
                dateTime: new Date(new Date(interview.date).getTime() + interview.durationMins * 60000).toISOString(),
                timeZone: 'UTC',
            },
        };
        return this.outlookCalendar.updateEvent(tenantId, interview.calendarEventId, event);
    }
    async deleteCalendarEvent(tenantId, interviewId) {
        await this.outlookCalendar.deleteEvent(tenantId, interviewId);
    }
    async handleWebhook(tenantId, event) {
        console.log(`Outlook Calendar webhook for tenant ${tenantId}`, event);
    }
};
exports.OutlookCalendarProvider = OutlookCalendarProvider;
exports.OutlookCalendarProvider = OutlookCalendarProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        outlook_oauth_1.OutlookOAuthService,
        outlook_api_1.OutlookCalendarApiService])
], OutlookCalendarProvider);
//# sourceMappingURL=outlook.provider.js.map