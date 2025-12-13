"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMetricsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const system_metrics_controller_1 = require("./system-metrics.controller");
const platform_metrics_service_1 = require("./services/platform-metrics.service");
const queue_metrics_service_1 = require("./services/queue-metrics.service");
const communication_metrics_service_1 = require("./services/communication-metrics.service");
const scheduling_metrics_service_1 = require("./services/scheduling-metrics.service");
const tenant_usage_service_1 = require("./services/tenant-usage.service");
const prisma_service_1 = require("../../common/prisma.service");
const queues_1 = require("../communication/queues");
let SystemMetricsModule = class SystemMetricsModule {
};
exports.SystemMetricsModule = SystemMetricsModule;
exports.SystemMetricsModule = SystemMetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: queues_1.COMMUNICATION_QUEUES.EMAIL }, { name: queues_1.COMMUNICATION_QUEUES.WHATSAPP }, { name: queues_1.COMMUNICATION_QUEUES.SMS }, { name: queues_1.COMMUNICATION_QUEUES.AUTOMATION }, { name: queues_1.COMMUNICATION_QUEUES.SCHEDULER }, { name: queues_1.COMMUNICATION_QUEUES.DLQ }),
        ],
        controllers: [system_metrics_controller_1.SystemMetricsController],
        providers: [
            prisma_service_1.PrismaService,
            platform_metrics_service_1.PlatformMetricsService,
            queue_metrics_service_1.QueueMetricsService,
            communication_metrics_service_1.CommunicationMetricsService,
            scheduling_metrics_service_1.SchedulingMetricsService,
            tenant_usage_service_1.TenantUsageService,
        ],
        exports: [platform_metrics_service_1.PlatformMetricsService],
    })
], SystemMetricsModule);
//# sourceMappingURL=system-metrics.module.js.map