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
exports.ProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const zoho_provider_1 = require("./providers/zoho/zoho.provider");
const google_provider_1 = require("./providers/google-calendar/google.provider");
const outlook_provider_1 = require("./providers/outlook-calendar/outlook.provider");
const zoho_oauth_1 = require("./providers/zoho/zoho.oauth");
const zoho_api_1 = require("./providers/zoho/zoho.api");
const google_oauth_1 = require("./providers/google-calendar/google.oauth");
const google_calendar_api_1 = require("./providers/google-calendar/google.calendar.api");
const outlook_oauth_1 = require("./providers/outlook-calendar/outlook.oauth");
const outlook_api_1 = require("./providers/outlook-calendar/outlook.api");
let ProviderFactory = class ProviderFactory {
    prisma;
    zohoOAuth;
    zohoApi;
    googleOAuth;
    googleCalendar;
    outlookOAuth;
    outlookCalendar;
    constructor(prisma, zohoOAuth, zohoApi, googleOAuth, googleCalendar, outlookOAuth, outlookCalendar) {
        this.prisma = prisma;
        this.zohoOAuth = zohoOAuth;
        this.zohoApi = zohoApi;
        this.googleOAuth = googleOAuth;
        this.googleCalendar = googleCalendar;
        this.outlookOAuth = outlookOAuth;
        this.outlookCalendar = outlookCalendar;
    }
    getProvider(provider) {
        switch (provider) {
            case 'zoho':
                return new zoho_provider_1.ZohoProvider(this.prisma, this.zohoOAuth, this.zohoApi);
            case 'google_calendar':
                return new google_provider_1.GoogleCalendarProvider(this.prisma, this.googleOAuth, this.googleCalendar);
            case 'outlook_calendar':
                return new outlook_provider_1.OutlookCalendarProvider(this.prisma, this.outlookOAuth, this.outlookCalendar);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
    getSupportedProviders() {
        return ['zoho', 'google_calendar', 'outlook_calendar'];
    }
    isSupported(provider) {
        return this.getSupportedProviders().includes(provider);
    }
};
exports.ProviderFactory = ProviderFactory;
exports.ProviderFactory = ProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zoho_oauth_1.ZohoOAuthService,
        zoho_api_1.ZohoApiService,
        google_oauth_1.GoogleOAuthService,
        google_calendar_api_1.GoogleCalendarApiService,
        outlook_oauth_1.OutlookOAuthService,
        outlook_api_1.OutlookCalendarApiService])
], ProviderFactory);
//# sourceMappingURL=provider.factory.js.map