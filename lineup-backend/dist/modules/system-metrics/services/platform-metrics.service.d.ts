import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export interface PlatformMetrics {
    apiRequests24h: number;
    errorRate: number;
    p95Latency: number;
    activeTenants7d: number;
    activeUsers7d: number;
}
export declare class PlatformMetricsService implements OnModuleInit, OnModuleDestroy {
    private redis;
    onModuleInit(): void;
    onModuleDestroy(): void;
    recordRequest(latencyMs: number, isError: boolean, tenantId?: string, userId?: string): Promise<void>;
    getMetrics(): Promise<PlatformMetrics>;
    clearMetrics(): Promise<void>;
}
