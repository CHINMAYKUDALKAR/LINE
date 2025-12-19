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
exports.SystemMetricsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const platform_metrics_service_1 = require("./services/platform-metrics.service");
const queue_metrics_service_1 = require("./services/queue-metrics.service");
const communication_metrics_service_1 = require("./services/communication-metrics.service");
const scheduling_metrics_service_1 = require("./services/scheduling-metrics.service");
const tenant_usage_service_1 = require("./services/tenant-usage.service");
const integration_metrics_service_1 = require("./services/integration-metrics.service");
let SystemMetricsController = class SystemMetricsController {
    platformMetrics;
    queueMetrics;
    communicationMetrics;
    schedulingMetrics;
    tenantUsage;
    integrationMetrics;
    constructor(platformMetrics, queueMetrics, communicationMetrics, schedulingMetrics, tenantUsage, integrationMetrics) {
        this.platformMetrics = platformMetrics;
        this.queueMetrics = queueMetrics;
        this.communicationMetrics = communicationMetrics;
        this.schedulingMetrics = schedulingMetrics;
        this.tenantUsage = tenantUsage;
        this.integrationMetrics = integrationMetrics;
    }
    async getPlatformMetrics() {
        return this.platformMetrics.getMetrics();
    }
    async getQueueMetrics() {
        return this.queueMetrics.getMetrics();
    }
    async getCommunicationMetrics() {
        return this.communicationMetrics.getMetrics();
    }
    async getSchedulingMetrics() {
        return this.schedulingMetrics.getMetrics();
    }
    async getTenantUsageMetrics() {
        return this.tenantUsage.getMetrics();
    }
    async getIntegrationMetrics() {
        return this.integrationMetrics.getMetrics();
    }
    async getSummary() {
        const [platform, queues, communication, scheduling, integrations] = await Promise.all([
            this.platformMetrics.getMetrics(),
            this.queueMetrics.getMetrics(),
            this.communicationMetrics.getMetrics(),
            this.schedulingMetrics.getMetrics(),
            this.integrationMetrics.getMetrics(),
        ]);
        const queueBacklog = queues.reduce((sum, q) => sum + q.waiting + q.active, 0);
        const queueFailures = queues.reduce((sum, q) => sum + q.failed24h, 0);
        return {
            status: platform.errorRate < 5 ? 'healthy' : platform.errorRate < 15 ? 'degraded' : 'unhealthy',
            timestamp: new Date().toISOString(),
            api: {
                requests24h: platform.apiRequests24h,
                errorRate: platform.errorRate,
                p95LatencyMs: platform.p95Latency,
            },
            queues: {
                backlog: queueBacklog,
                failures24h: queueFailures,
            },
            integrations: {
                connected: integrations.connectedProviders,
                syncs24h: integrations.totalSyncs24h,
                successRate: integrations.overallSuccessRate,
            },
            communication: {
                sent24h: communication.messagesToday || 0,
                failed24h: communication.failedCount || 0,
            },
            users: {
                activeTenants7d: platform.activeTenants7d,
                activeUsers7d: platform.activeUsers7d,
            },
        };
    }
};
exports.SystemMetricsController = SystemMetricsController;
__decorate([
    (0, common_1.Get)('platform'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getPlatformMetrics", null);
__decorate([
    (0, common_1.Get)('queues'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getQueueMetrics", null);
__decorate([
    (0, common_1.Get)('communication'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getCommunicationMetrics", null);
__decorate([
    (0, common_1.Get)('scheduling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getSchedulingMetrics", null);
__decorate([
    (0, common_1.Get)('tenant-usage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getTenantUsageMetrics", null);
__decorate([
    (0, common_1.Get)('integrations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getIntegrationMetrics", null);
__decorate([
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemMetricsController.prototype, "getSummary", null);
exports.SystemMetricsController = SystemMetricsController = __decorate([
    (0, common_1.Controller)('api/v1/system-metrics'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [platform_metrics_service_1.PlatformMetricsService,
        queue_metrics_service_1.QueueMetricsService,
        communication_metrics_service_1.CommunicationMetricsService,
        scheduling_metrics_service_1.SchedulingMetricsService,
        tenant_usage_service_1.TenantUsageService,
        integration_metrics_service_1.IntegrationMetricsService])
], SystemMetricsController);
//# sourceMappingURL=system-metrics.controller.js.map