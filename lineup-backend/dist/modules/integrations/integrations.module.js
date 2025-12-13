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
const prisma_service_1 = require("../../common/prisma.service");
const audit_module_1 = require("../audit/audit.module");
const integrations_controller_1 = require("./integrations.controller");
const webhook_controller_1 = require("./webhooks/webhook.controller");
const integrations_service_1 = require("./integrations.service");
const webhook_service_1 = require("./webhooks/webhook.service");
const provider_factory_1 = require("./provider.factory");
const zoho_provider_1 = require("./providers/zoho/zoho.provider");
const zoho_oauth_1 = require("./providers/zoho/zoho.oauth");
const zoho_api_1 = require("./providers/zoho/zoho.api");
const google_provider_1 = require("./providers/google-calendar/google.provider");
const google_oauth_1 = require("./providers/google-calendar/google.oauth");
const google_calendar_api_1 = require("./providers/google-calendar/google.calendar.api");
const outlook_provider_1 = require("./providers/outlook-calendar/outlook.provider");
const outlook_oauth_1 = require("./providers/outlook-calendar/outlook.oauth");
const outlook_api_1 = require("./providers/outlook-calendar/outlook.api");
const sync_processor_1 = require("./processors/sync.processor");
const dlq_processor_1 = require("./processors/dlq.processor");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'integration-sync' }, { name: 'integration-dlq' }),
            audit_module_1.AuditModule,
        ],
        controllers: [integrations_controller_1.IntegrationsController, webhook_controller_1.WebhookController],
        providers: [
            prisma_service_1.PrismaService,
            integrations_service_1.IntegrationsService,
            webhook_service_1.WebhookService,
            provider_factory_1.ProviderFactory,
            zoho_provider_1.ZohoProvider,
            zoho_oauth_1.ZohoOAuthService,
            zoho_api_1.ZohoApiService,
            google_provider_1.GoogleCalendarProvider,
            google_oauth_1.GoogleOAuthService,
            google_calendar_api_1.GoogleCalendarApiService,
            outlook_provider_1.OutlookCalendarProvider,
            outlook_oauth_1.OutlookOAuthService,
            outlook_api_1.OutlookCalendarApiService,
            sync_processor_1.SyncProcessor,
            dlq_processor_1.DlqProcessor,
        ],
        exports: [integrations_service_1.IntegrationsService, provider_factory_1.ProviderFactory],
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map