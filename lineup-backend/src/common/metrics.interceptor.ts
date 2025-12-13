import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PlatformMetricsService } from '../modules/system-metrics/services/platform-metrics.service';

/**
 * Global interceptor to track API request metrics
 * Records request latency, error rates, and active users/tenants
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private metricsService: PlatformMetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        // Extract tenant and user IDs from request
        const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
        const userId = request.user?.id;

        return next.handle().pipe(
            tap(() => {
                const latency = Date.now() - startTime;
                this.metricsService.recordRequest(latency, false, tenantId, userId)
                    .catch(err => console.error('Failed to record metrics:', err));
            }),
            catchError((error) => {
                const latency = Date.now() - startTime;
                this.metricsService.recordRequest(latency, true, tenantId, userId)
                    .catch(err => console.error('Failed to record metrics:', err));
                throw error;
            }),
        );
    }
}
