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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutlookCalendarApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const outlook_oauth_1 = require("./outlook.oauth");
let OutlookCalendarApiService = class OutlookCalendarApiService {
    outlookOAuth;
    baseUrl = 'https://graph.microsoft.com/v1.0';
    constructor(outlookOAuth) {
        this.outlookOAuth = outlookOAuth;
    }
    async createClient(tenantId) {
        const accessToken = await this.outlookOAuth.getValidToken(tenantId);
        return axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async createEvent(tenantId, event) {
        const client = await this.createClient(tenantId);
        const response = await client.post('/me/events', event);
        return response.data;
    }
    async updateEvent(tenantId, eventId, event) {
        const client = await this.createClient(tenantId);
        const response = await client.patch(`/me/events/${eventId}`, event);
        return response.data;
    }
    async deleteEvent(tenantId, eventId) {
        const client = await this.createClient(tenantId);
        await client.delete(`/me/events/${eventId}`);
    }
    async getFreeBusy(tenantId, timeMin, timeMax, emails) {
        const client = await this.createClient(tenantId);
        const response = await client.post('/me/calendar/getSchedule', {
            schedules: emails,
            startTime: {
                dateTime: timeMin.toISOString(),
                timeZone: 'UTC',
            },
            endTime: {
                dateTime: timeMax.toISOString(),
                timeZone: 'UTC',
            },
        });
        return response.data;
    }
};
exports.OutlookCalendarApiService = OutlookCalendarApiService;
exports.OutlookCalendarApiService = OutlookCalendarApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [outlook_oauth_1.OutlookOAuthService])
], OutlookCalendarApiService);
//# sourceMappingURL=outlook.api.js.map