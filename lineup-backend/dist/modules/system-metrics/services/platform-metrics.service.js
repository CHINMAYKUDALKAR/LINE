"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformMetricsService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const KEYS = {
    REQUESTS_24H: 'metrics:requests:24h',
    ERRORS_24H: 'metrics:errors:24h',
    LATENCIES: 'metrics:latencies',
    ACTIVE_TENANTS: 'metrics:active_tenants:7d',
    ACTIVE_USERS: 'metrics:active_users:7d',
};
const TTL_24H = 86400;
const TTL_7D = 604800;
let PlatformMetricsService = class PlatformMetricsService {
    redis;
    onModuleInit() {
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }
    onModuleDestroy() {
        this.redis?.disconnect();
    }
    async recordRequest(latencyMs, isError, tenantId, userId) {
        const now = Date.now();
        const pipeline = this.redis.pipeline();
        pipeline.incr(KEYS.REQUESTS_24H);
        pipeline.expire(KEYS.REQUESTS_24H, TTL_24H);
        if (isError) {
            pipeline.incr(KEYS.ERRORS_24H);
            pipeline.expire(KEYS.ERRORS_24H, TTL_24H);
        }
        pipeline.zadd(KEYS.LATENCIES, now, `${latencyMs}:${now}`);
        pipeline.zremrangebyscore(KEYS.LATENCIES, 0, now - TTL_24H * 1000);
        if (tenantId) {
            pipeline.sadd(KEYS.ACTIVE_TENANTS, tenantId);
            pipeline.expire(KEYS.ACTIVE_TENANTS, TTL_7D);
        }
        if (userId) {
            pipeline.sadd(KEYS.ACTIVE_USERS, userId);
            pipeline.expire(KEYS.ACTIVE_USERS, TTL_7D);
        }
        await pipeline.exec();
    }
    async getMetrics() {
        const [requests24h, errors24h, latencies, activeTenants, activeUsers,] = await Promise.all([
            this.redis.get(KEYS.REQUESTS_24H),
            this.redis.get(KEYS.ERRORS_24H),
            this.redis.zrange(KEYS.LATENCIES, 0, -1),
            this.redis.scard(KEYS.ACTIVE_TENANTS),
            this.redis.scard(KEYS.ACTIVE_USERS),
        ]);
        const totalRequests = parseInt(requests24h || '0');
        const totalErrors = parseInt(errors24h || '0');
        const latencyValues = latencies
            .map(entry => parseFloat(entry.split(':')[0]))
            .sort((a, b) => a - b);
        let p95Latency = 0;
        if (latencyValues.length > 0) {
            const p95Index = Math.floor(latencyValues.length * 0.95);
            p95Latency = latencyValues[p95Index] || latencyValues[latencyValues.length - 1];
        }
        return {
            apiRequests24h: totalRequests,
            errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
            p95Latency: Math.round(p95Latency),
            activeTenants7d: activeTenants,
            activeUsers7d: activeUsers,
        };
    }
    async clearMetrics() {
        await this.redis.del(KEYS.REQUESTS_24H, KEYS.ERRORS_24H, KEYS.LATENCIES, KEYS.ACTIVE_TENANTS, KEYS.ACTIVE_USERS);
    }
};
exports.PlatformMetricsService = PlatformMetricsService;
exports.PlatformMetricsService = PlatformMetricsService = __decorate([
    (0, common_1.Injectable)()
], PlatformMetricsService);
//# sourceMappingURL=platform-metrics.service.js.map