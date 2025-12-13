import { PlatformMetricsService } from './services/platform-metrics.service';
import { QueueMetricsService } from './services/queue-metrics.service';
import { CommunicationMetricsService } from './services/communication-metrics.service';
import { SchedulingMetricsService } from './services/scheduling-metrics.service';
import { TenantUsageService } from './services/tenant-usage.service';
export declare class SystemMetricsController {
    private platformMetrics;
    private queueMetrics;
    private communicationMetrics;
    private schedulingMetrics;
    private tenantUsage;
    constructor(platformMetrics: PlatformMetricsService, queueMetrics: QueueMetricsService, communicationMetrics: CommunicationMetricsService, schedulingMetrics: SchedulingMetricsService, tenantUsage: TenantUsageService);
    getPlatformMetrics(): Promise<import("./services/platform-metrics.service").PlatformMetrics>;
    getQueueMetrics(): Promise<import("./services/queue-metrics.service").QueueMetrics[]>;
    getCommunicationMetrics(): Promise<import("./services/communication-metrics.service").CommunicationMetrics>;
    getSchedulingMetrics(): Promise<import("./services/scheduling-metrics.service").SchedulingMetrics>;
    getTenantUsageMetrics(): Promise<import("./services/tenant-usage.service").TenantUsageMetrics[]>;
}
