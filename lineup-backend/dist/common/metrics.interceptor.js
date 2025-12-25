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
var MetricsInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const platform_metrics_service_1 = require("../modules/system-metrics/services/platform-metrics.service");
let MetricsInterceptor = MetricsInterceptor_1 = class MetricsInterceptor {
    metricsService;
    logger = new common_1.Logger(MetricsInterceptor_1.name);
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
        const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];
        const userId = request.user?.id;
        return next.handle().pipe((0, operators_1.tap)(() => {
            const latency = Date.now() - startTime;
            this.metricsService.recordRequest(latency, false, tenantId, userId)
                .catch(err => this.logger.warn('Failed to record metrics:', err.message));
        }), (0, operators_1.catchError)((error) => {
            const latency = Date.now() - startTime;
            this.metricsService.recordRequest(latency, true, tenantId, userId)
                .catch(err => this.logger.warn('Failed to record metrics:', err.message));
            throw error;
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = MetricsInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_metrics_service_1.PlatformMetricsService])
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map