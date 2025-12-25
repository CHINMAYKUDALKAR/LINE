import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlatformMetricsService } from '../modules/system-metrics/services/platform-metrics.service';
export declare class MetricsInterceptor implements NestInterceptor {
    private metricsService;
    private readonly logger;
    constructor(metricsService: PlatformMetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
