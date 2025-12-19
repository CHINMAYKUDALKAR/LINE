import { PlatformMetricsService } from './services/platform-metrics.service';
import { QueueMetricsService } from './services/queue-metrics.service';
import { CommunicationMetricsService } from './services/communication-metrics.service';
import { SchedulingMetricsService } from './services/scheduling-metrics.service';
import { TenantUsageService } from './services/tenant-usage.service';
import { IntegrationMetricsService } from './services/integration-metrics.service';
export declare class SystemMetricsController {
    private platformMetrics;
    private queueMetrics;
    private communicationMetrics;
    private schedulingMetrics;
    private tenantUsage;
    private integrationMetrics;
    constructor(platformMetrics: PlatformMetricsService, queueMetrics: QueueMetricsService, communicationMetrics: CommunicationMetricsService, schedulingMetrics: SchedulingMetricsService, tenantUsage: TenantUsageService, integrationMetrics: IntegrationMetricsService);
    getPlatformMetrics(): Promise<import("./services/platform-metrics.service").PlatformMetrics>;
    getQueueMetrics(): Promise<import("./services/queue-metrics.service").QueueMetrics[]>;
    getCommunicationMetrics(): Promise<import("./services/communication-metrics.service").CommunicationMetrics>;
    getSchedulingMetrics(): Promise<import("./services/scheduling-metrics.service").SchedulingMetrics>;
    getTenantUsageMetrics(): Promise<import("./services/tenant-usage.service").TenantUsageMetrics[]>;
    getIntegrationMetrics(): Promise<import("./services/integration-metrics.service").IntegrationMetricsSummary>;
    getSummary(): Promise<{
        status: string;
        timestamp: string;
        api: {
            requests24h: number;
            errorRate: number;
            p95LatencyMs: number;
        };
        queues: {
            backlog: number;
            failures24h: number;
        };
        integrations: {
            connected: number;
            syncs24h: number;
            successRate: number;
        };
        communication: {
            sent24h: number;
            failed24h: number;
        };
        users: {
            activeTenants7d: number;
            activeUsers7d: number;
        };
    }>;
}
