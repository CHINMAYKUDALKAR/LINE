"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenant_middleware_1 = require("./common/tenant.middleware");
const logging_interceptor_1 = require("./common/logging.interceptor");
const metrics_interceptor_1 = require("./common/metrics.interceptor");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const event_emitter_1 = require("@nestjs/event-emitter");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const teams_module_1 = require("./modules/teams/teams.module");
const candidates_module_1 = require("./modules/candidates/candidates.module");
const interviews_module_1 = require("./modules/interviews/interviews.module");
const feedback_module_1 = require("./modules/feedback/feedback.module");
const audit_module_1 = require("./modules/audit/audit.module");
const reports_module_1 = require("./modules/reports/reports.module");
const email_module_1 = require("./modules/email/email.module");
const storage_module_1 = require("./modules/storage/storage.module");
const communication_module_1 = require("./modules/communication/communication.module");
const calendar_module_1 = require("./modules/calendar/calendar.module");
const automation_module_1 = require("./modules/automation/automation.module");
const recycle_bin_module_1 = require("./modules/recycle-bin/recycle-bin.module");
const system_metrics_module_1 = require("./modules/system-metrics/system-metrics.module");
const sso_module_1 = require("./modules/sso/sso.module");
const identity_provider_module_1 = require("./modules/identity-provider/identity-provider.module");
const settings_module_1 = require("./modules/settings/settings.module");
const integrations_module_1 = require("./modules/integrations/integrations.module");
const health_controller_1 = require("./common/health.controller");
const exceptions_filter_1 = require("./common/exceptions.filter");
const app_common_module_1 = require("./common/app-common.module");
const rate_limit_1 = require("./common/rate-limit");
const ip_allowlist_guard_1 = require("./common/ip-allowlist.guard");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_middleware_1.TenantMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            app_common_module_1.AppCommonModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            teams_module_1.TeamsModule,
            candidates_module_1.CandidatesModule,
            interviews_module_1.InterviewsModule,
            feedback_module_1.FeedbackModule,
            reports_module_1.ReportsModule,
            audit_module_1.AuditModule,
            email_module_1.EmailModule,
            storage_module_1.StorageModule,
            communication_module_1.CommunicationModule,
            calendar_module_1.CalendarModule,
            recycle_bin_module_1.RecycleBinModule,
            system_metrics_module_1.SystemMetricsModule,
            automation_module_1.AutomationModule,
            sso_module_1.SSOModule,
            identity_provider_module_1.IdentityProviderModule,
            settings_module_1.SettingsModule,
            integrations_module_1.IntegrationsModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            { provide: core_1.APP_GUARD, useClass: rate_limit_1.RateLimitGuard },
            { provide: core_1.APP_GUARD, useClass: ip_allowlist_guard_1.IPAllowlistGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: metrics_interceptor_1.MetricsInterceptor },
            { provide: core_1.APP_FILTER, useClass: exceptions_filter_1.GlobalExceptionFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map