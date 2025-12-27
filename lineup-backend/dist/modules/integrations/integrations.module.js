"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma.service");
const audit_module_1 = require("../audit/audit.module");
const zoho_module_1 = require("./zoho/zoho.module");
const integrations_controller_1 = require("./integrations.controller");
const oauth_callback_controller_1 = require("./oauth-callback.controller");
const webhook_controller_1 = require("./webhooks/webhook.controller");
const integrations_service_1 = require("./integrations.service");
const webhook_service_1 = require("./webhooks/webhook.service");
const provider_factory_1 = require("./provider.factory");
const sync_log_service_1 = require("./services/sync-log.service");
const integration_events_service_1 = require("./services/integration-events.service");
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
const salesforce_sync_handler_1 = require("./providers/salesforce/salesforce.sync-handler");
const hubspot_provider_1 = require("./providers/hubspot/hubspot.provider");
const hubspot_oauth_1 = require("./providers/hubspot/hubspot.oauth");
const hubspot_api_1 = require("./providers/hubspot/hubspot.api");
const hubspot_sync_handler_1 = require("./providers/hubspot/hubspot.sync-handler");
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
const sync_processor_1 = require("./processors/sync.processor");
const dlq_processor_1 = require("./processors/dlq.processor");
const scheduled_import_processor_1 = require("./processors/scheduled-import.processor");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'integration-sync' }, { name: 'integration-dlq' }, { name: 'zoho-sync' }),
            audit_module_1.AuditModule,
            config_1.ConfigModule,
            zoho_module_1.ZohoModule,
        ],
        controllers: [integrations_controller_1.IntegrationsController, oauth_callback_controller_1.OAuthCallbackController, webhook_controller_1.WebhookController],
        providers: [
            prisma_service_1.PrismaService,
            integrations_service_1.IntegrationsService,
            webhook_service_1.WebhookService,
            provider_factory_1.ProviderFactory,
            sync_log_service_1.SyncLogService,
            integration_events_service_1.IntegrationEventsService,
            zoho_provider_1.ZohoProvider,
            zoho_oauth_1.ZohoOAuthService,
            zoho_api_1.ZohoApiService,
            zoho_sync_handler_1.ZohoSyncHandler,
            google_provider_1.GoogleCalendarProvider,
            google_oauth_1.GoogleOAuthService,
            google_calendar_api_1.GoogleCalendarApiService,
            outlook_provider_1.OutlookCalendarProvider,
            outlook_oauth_1.OutlookOAuthService,
            outlook_api_1.OutlookCalendarApiService,
            salesforce_provider_1.SalesforceProvider,
            salesforce_oauth_1.SalesforceOAuthService,
            salesforce_api_1.SalesforceApiService,
            salesforce_sync_handler_1.SalesforceSyncHandler,
            hubspot_provider_1.HubspotProvider,
            hubspot_oauth_1.HubspotOAuthService,
            hubspot_api_1.HubspotApiService,
            hubspot_sync_handler_1.HubspotSyncHandler,
            workday_provider_1.WorkdayProvider,
            workday_auth_1.WorkdayAuthService,
            workday_api_1.WorkdayApiService,
            workday_sync_handler_1.WorkdaySyncHandler,
            lever_provider_1.LeverProvider,
            lever_auth_1.LeverAuthService,
            lever_api_1.LeverApiService,
            lever_sync_handler_1.LeverSyncHandler,
            greenhouse_provider_1.GreenhouseProvider,
            greenhouse_auth_1.GreenhouseAuthService,
            greenhouse_api_1.GreenhouseApiService,
            greenhouse_sync_handler_1.GreenhouseSyncHandler,
            bamboohr_provider_1.BambooHRProvider,
            bamboohr_oauth_1.BambooHROAuthService,
            bamboohr_api_1.BambooHRApiService,
            bamboohr_handoff_handler_1.BambooHRHandoffHandler,
            sync_processor_1.SyncProcessor,
            dlq_processor_1.DlqProcessor,
            scheduled_import_processor_1.ScheduledImportProcessor,
        ],
        exports: [integrations_service_1.IntegrationsService, provider_factory_1.ProviderFactory, integration_events_service_1.IntegrationEventsService],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map