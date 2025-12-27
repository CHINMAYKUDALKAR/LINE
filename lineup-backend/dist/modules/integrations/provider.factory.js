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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma.service");
const zoho_provider_1 = require("./providers/zoho/zoho.provider");
const zoho_oauth_1 = require("./providers/zoho/zoho.oauth");
const zoho_api_1 = require("./providers/zoho/zoho.api");
const zoho_sync_handler_1 = require("./providers/zoho/zoho.sync-handler");
const google_provider_1 = require("./providers/google-calendar/google.provider");
const google_oauth_1 = require("./providers/google-calendar/google.oauth");
const google_calendar_api_1 = require("./providers/google-calendar/google.calendar.api");
const outlook_provider_1 = require("./providers/outlook-calendar/outlook.provider");
const outlook_oauth_1 = require("./providers/outlook-calendar/outlook.oauth");
const outlook_api_1 = require("./providers/outlook-calendar/outlook.api");
const salesforce_provider_1 = require("./providers/salesforce/salesforce.provider");
const salesforce_oauth_1 = require("./providers/salesforce/salesforce.oauth");
const salesforce_api_1 = require("./providers/salesforce/salesforce.api");
const hubspot_provider_1 = require("./providers/hubspot/hubspot.provider");
const hubspot_oauth_1 = require("./providers/hubspot/hubspot.oauth");
const hubspot_api_1 = require("./providers/hubspot/hubspot.api");
const hubspot_sync_handler_1 = require("./providers/hubspot/hubspot.sync-handler");
const sync_log_service_1 = require("./services/sync-log.service");
const workday_provider_1 = require("./providers/workday/workday.provider");
const workday_auth_1 = require("./providers/workday/workday.auth");
const workday_api_1 = require("./providers/workday/workday.api");
const workday_sync_handler_1 = require("./providers/workday/workday.sync-handler");
const lever_provider_1 = require("./providers/lever/lever.provider");
const lever_auth_1 = require("./providers/lever/lever.auth");
const lever_api_1 = require("./providers/lever/lever.api");
const lever_sync_handler_1 = require("./providers/lever/lever.sync-handler");
const greenhouse_provider_1 = require("./providers/greenhouse/greenhouse.provider");
const greenhouse_auth_1 = require("./providers/greenhouse/greenhouse.auth");
const greenhouse_api_1 = require("./providers/greenhouse/greenhouse.api");
const greenhouse_sync_handler_1 = require("./providers/greenhouse/greenhouse.sync-handler");
const bamboohr_provider_1 = require("./providers/bamboohr/bamboohr.provider");
const bamboohr_oauth_1 = require("./providers/bamboohr/bamboohr.oauth");
const bamboohr_api_1 = require("./providers/bamboohr/bamboohr.api");
const bamboohr_handoff_handler_1 = require("./providers/bamboohr/bamboohr.handoff-handler");
let ProviderFactory = class ProviderFactory {
    prisma;
    configService;
    zohoOAuth;
    zohoApi;
    zohoSync;
    googleOAuth;
    googleCalendar;
    outlookOAuth;
    outlookCalendar;
    salesforceOAuth;
    salesforceApi;
    hubspotOAuth;
    hubspotApi;
    hubspotSync;
    syncLogService;
    workdayAuth;
    workdayApi;
    workdaySync;
    leverAuth;
    leverApi;
    leverSync;
    greenhouseAuth;
    greenhouseApi;
    greenhouseSync;
    bamboohrOAuth;
    bamboohrApi;
    bamboohrHandoff;
    constructor(prisma, configService, zohoOAuth, zohoApi, zohoSync, googleOAuth, googleCalendar, outlookOAuth, outlookCalendar, salesforceOAuth, salesforceApi, hubspotOAuth, hubspotApi, hubspotSync, syncLogService, workdayAuth, workdayApi, workdaySync, leverAuth, leverApi, leverSync, greenhouseAuth, greenhouseApi, greenhouseSync, bamboohrOAuth, bamboohrApi, bamboohrHandoff) {
        this.prisma = prisma;
        this.configService = configService;
        this.zohoOAuth = zohoOAuth;
        this.zohoApi = zohoApi;
        this.zohoSync = zohoSync;
        this.googleOAuth = googleOAuth;
        this.googleCalendar = googleCalendar;
        this.outlookOAuth = outlookOAuth;
        this.outlookCalendar = outlookCalendar;
        this.salesforceOAuth = salesforceOAuth;
        this.salesforceApi = salesforceApi;
        this.hubspotOAuth = hubspotOAuth;
        this.hubspotApi = hubspotApi;
        this.hubspotSync = hubspotSync;
        this.syncLogService = syncLogService;
        this.workdayAuth = workdayAuth;
        this.workdayApi = workdayApi;
        this.workdaySync = workdaySync;
        this.leverAuth = leverAuth;
        this.leverApi = leverApi;
        this.leverSync = leverSync;
        this.greenhouseAuth = greenhouseAuth;
        this.greenhouseApi = greenhouseApi;
        this.greenhouseSync = greenhouseSync;
        this.bamboohrOAuth = bamboohrOAuth;
        this.bamboohrApi = bamboohrApi;
        this.bamboohrHandoff = bamboohrHandoff;
    }
    getProvider(provider) {
        switch (provider) {
            case 'zoho':
                return new zoho_provider_1.ZohoProvider(this.prisma, this.zohoOAuth, this.zohoApi, this.zohoSync);
            case 'google_calendar':
                return new google_provider_1.GoogleCalendarProvider(this.prisma, this.googleOAuth, this.googleCalendar);
            case 'outlook_calendar':
                return new outlook_provider_1.OutlookCalendarProvider(this.prisma, this.outlookOAuth, this.outlookCalendar);
            case 'salesforce':
                return new salesforce_provider_1.SalesforceProvider(this.prisma, this.salesforceOAuth, this.salesforceApi);
            case 'hubspot':
                return new hubspot_provider_1.HubspotProvider(this.prisma, this.hubspotOAuth, this.hubspotApi, this.hubspotSync, this.syncLogService);
            case 'workday':
                return new workday_provider_1.WorkdayProvider(this.prisma, this.workdayAuth, this.workdayApi, this.workdaySync, this.syncLogService);
            case 'lever':
                return new lever_provider_1.LeverProvider(this.prisma, this.leverAuth, this.leverApi, this.leverSync, this.syncLogService);
            case 'greenhouse':
                return new greenhouse_provider_1.GreenhouseProvider(this.prisma, this.greenhouseAuth, this.greenhouseApi, this.greenhouseSync, this.syncLogService);
            case 'bamboohr':
                return new bamboohr_provider_1.BambooHRProvider(this.prisma, this.bamboohrOAuth, this.bamboohrApi, this.bamboohrHandoff, this.syncLogService);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
    getSupportedProviders() {
        return [
            { name: 'zoho', category: 'CRM', status: 'ready' },
            { name: 'salesforce', category: 'CRM', status: 'ready' },
            { name: 'hubspot', category: 'CRM', status: 'ready' },
            { name: 'lever', category: 'ATS', status: 'ready' },
            { name: 'greenhouse', category: 'ATS', status: 'ready' },
            { name: 'workday', category: 'ATS', status: 'ready' },
            { name: 'bamboohr', category: 'HRIS', status: 'ready' },
            { name: 'google_calendar', category: 'Calendar', status: 'ready' },
            { name: 'outlook_calendar', category: 'Calendar', status: 'ready' },
        ];
    }
    getProviderNames() {
        return this.getSupportedProviders().map(p => p.name);
    }
    isSupported(provider) {
        return this.getProviderNames().includes(provider);
    }
};
exports.ProviderFactory = ProviderFactory;
exports.ProviderFactory = ProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        zoho_oauth_1.ZohoOAuthService,
        zoho_api_1.ZohoApiService,
        zoho_sync_handler_1.ZohoSyncHandler,
        google_oauth_1.GoogleOAuthService,
        google_calendar_api_1.GoogleCalendarApiService,
        outlook_oauth_1.OutlookOAuthService,
        outlook_api_1.OutlookCalendarApiService,
        salesforce_oauth_1.SalesforceOAuthService,
        salesforce_api_1.SalesforceApiService,
        hubspot_oauth_1.HubspotOAuthService,
        hubspot_api_1.HubspotApiService,
        hubspot_sync_handler_1.HubspotSyncHandler,
        sync_log_service_1.SyncLogService,
        workday_auth_1.WorkdayAuthService,
        workday_api_1.WorkdayApiService,
        workday_sync_handler_1.WorkdaySyncHandler,
        lever_auth_1.LeverAuthService,
        lever_api_1.LeverApiService,
        lever_sync_handler_1.LeverSyncHandler,
        greenhouse_auth_1.GreenhouseAuthService,
        greenhouse_api_1.GreenhouseApiService,
        greenhouse_sync_handler_1.GreenhouseSyncHandler,
        bamboohr_oauth_1.BambooHROAuthService,
        bamboohr_api_1.BambooHRApiService,
        bamboohr_handoff_handler_1.BambooHRHandoffHandler])
], ProviderFactory);
//# sourceMappingURL=provider.factory.js.map