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
exports.GoogleCalendarApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const google_oauth_1 = require("./google.oauth");
let GoogleCalendarApiService = class GoogleCalendarApiService {
    googleOAuth;
    baseUrl = 'https://www.googleapis.com/calendar/v3';
    constructor(googleOAuth) {
        this.googleOAuth = googleOAuth;
    }
    async createClient(tenantId) {
        const accessToken = await this.googleOAuth.getValidToken(tenantId);
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
        const response = await client.post('/calendars/primary/events', event);
        return response.data;
    }
    async updateEvent(tenantId, eventId, event) {
        const client = await this.createClient(tenantId);
        const response = await client.put(`/calendars/primary/events/${eventId}`, event);
        return response.data;
    }
    async deleteEvent(tenantId, eventId) {
        const client = await this.createClient(tenantId);
        await client.delete(`/calendars/primary/events/${eventId}`);
    }
    async getFreeBusy(tenantId, timeMin, timeMax, calendars) {
        const client = await this.createClient(tenantId);
        const response = await client.post('/freeBusy', {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            items: calendars.map(id => ({ id })),
        });
        return response.data;
    }
};
exports.GoogleCalendarApiService = GoogleCalendarApiService;
exports.GoogleCalendarApiService = GoogleCalendarApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_oauth_1.GoogleOAuthService])
], GoogleCalendarApiService);
//# sourceMappingURL=google.calendar.api.js.map