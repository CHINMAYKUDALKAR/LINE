import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PlatformMetricsService } from './services/platform-metrics.service';
import { QueueMetricsService } from './services/queue-metrics.service';
import { CommunicationMetricsService } from './services/communication-metrics.service';
import { SchedulingMetricsService } from './services/scheduling-metrics.service';
import { TenantUsageService } from './services/tenant-usage.service';

@Controller('api/v1/system-metrics')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('ADMIN')
export class SystemMetricsController {
    constructor(
        private platformMetrics: PlatformMetricsService,
        private queueMetrics: QueueMetricsService,
        private communicationMetrics: CommunicationMetricsService,
        private schedulingMetrics: SchedulingMetricsService,
        private tenantUsage: TenantUsageService,
    ) { }

    /**
     * GET /api/v1/system-metrics/platform
     * Returns platform-wide metrics including API requests, error rate, latency, and active users/tenants
     */
    @Get('platform')
    async getPlatformMetrics() {
        return this.platformMetrics.getMetrics();
    }

    /**
     * GET /api/v1/system-metrics/queues
     * Returns metrics for all BullMQ queues
     */
    @Get('queues')
    async getQueueMetrics() {
        return this.queueMetrics.getMetrics();
    }

    /**
     * GET /api/v1/system-metrics/communication
     * Returns communication/messaging metrics from MessageLog
     */
    @Get('communication')
    async getCommunicationMetrics() {
        return this.communicationMetrics.getMetrics();
    }

    /**
     * GET /api/v1/system-metrics/scheduling
     * Returns scheduling/interview metrics
     */
    @Get('scheduling')
    async getSchedulingMetrics() {
        return this.schedulingMetrics.getMetrics();
    }

    /**
     * GET /api/v1/system-metrics/tenant-usage
     * Returns per-tenant usage statistics
     */
    @Get('tenant-usage')
    async getTenantUsageMetrics() {
        return this.tenantUsage.getMetrics();
    }
}
