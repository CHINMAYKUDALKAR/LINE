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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RateLimitGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ioredis_1 = __importDefault(require("ioredis"));
const rate_limit_types_1 = require("./rate-limit.types");
const rate_limit_config_1 = require("./rate-limit.config");
let RateLimitGuard = RateLimitGuard_1 = class RateLimitGuard {
    reflector;
    redis;
    logger = new common_1.Logger(RateLimitGuard_1.name);
    constructor(reflector, redis) {
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(context) {
        const handler = context.getHandler();
        const classRef = context.getClass();
        const skipHandler = this.reflector.get(rate_limit_types_1.RATE_LIMIT_SKIP_KEY, handler);
        const skipClass = this.reflector.get(rate_limit_types_1.RATE_LIMIT_SKIP_KEY, classRef);
        if (skipHandler || skipClass) {
            return true;
        }
        const profile = this.reflector.get(rate_limit_types_1.RATE_LIMIT_PROFILE_KEY, handler)
            || this.reflector.get(rate_limit_types_1.RATE_LIMIT_PROFILE_KEY, classRef)
            || rate_limit_types_1.RateLimitProfile.READ;
        if (profile === rate_limit_types_1.RateLimitProfile.NONE) {
            return true;
        }
        const config = (0, rate_limit_config_1.getRateLimitConfig)(profile);
        if (!config.rules || config.rules.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const ip = this.getClientIP(request);
        const userId = request.user?.sub || request.user?.id || null;
        const tenantId = request.tenantId || request.user?.activeTenantId || null;
        let mostRestrictiveResult = null;
        for (const rule of config.rules) {
            const key = this.buildKey(profile, rule.scope, { ip, userId, tenantId });
            if (!key) {
                continue;
            }
            const result = await this.checkLimit(key, rule);
            if (!mostRestrictiveResult || result.remaining < mostRestrictiveResult.remaining) {
                mostRestrictiveResult = result;
            }
            if (!result.allowed) {
                this.setRateLimitHeaders(response, result);
                this.logger.warn(`Rate limit exceeded: profile=${profile}, scope=${rule.scope}, ` +
                    `key=${key}, current=${result.current}/${result.limit}`);
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    error: 'Too Many Requests',
                    message: this.getErrorMessage(profile, rule.scope),
                    retryAfter: result.resetInSeconds,
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        if (mostRestrictiveResult) {
            this.setRateLimitHeaders(response, mostRestrictiveResult);
        }
        return true;
    }
    buildKey(profile, scope, identifiers) {
        const prefix = `rl:${profile}`;
        switch (scope) {
            case rate_limit_types_1.RateLimitScope.IP:
                return `${prefix}:ip:${identifiers.ip}`;
            case rate_limit_types_1.RateLimitScope.USER:
                if (!identifiers.userId)
                    return null;
                return `${prefix}:user:${identifiers.userId}`;
            case rate_limit_types_1.RateLimitScope.TENANT:
                if (!identifiers.tenantId)
                    return null;
                return `${prefix}:tenant:${identifiers.tenantId}`;
            case rate_limit_types_1.RateLimitScope.USER_AND_TENANT:
                if (!identifiers.userId || !identifiers.tenantId)
                    return null;
                return `${prefix}:ut:${identifiers.tenantId}:${identifiers.userId}`;
            default:
                return null;
        }
    }
    async checkLimit(key, rule) {
        const now = Date.now();
        const windowMs = rule.windowSeconds * 1000;
        const windowKey = `${key}:${Math.floor(now / windowMs)}`;
        const prevWindowKey = `${key}:${Math.floor(now / windowMs) - 1}`;
        try {
            const pipeline = this.redis.pipeline();
            pipeline.incr(windowKey);
            pipeline.expire(windowKey, rule.windowSeconds * 2);
            pipeline.get(prevWindowKey);
            const results = await pipeline.exec();
            const currentCount = results?.[0]?.[1] || 0;
            const prevCount = parseInt(results?.[2]?.[1] || '0', 10);
            const windowProgress = (now % windowMs) / windowMs;
            const weightedCount = Math.floor(currentCount + prevCount * (1 - windowProgress));
            const allowed = weightedCount <= rule.max;
            const remaining = Math.max(0, rule.max - weightedCount);
            const resetInSeconds = Math.ceil((windowMs - (now % windowMs)) / 1000);
            return {
                allowed,
                current: weightedCount,
                limit: rule.max,
                remaining,
                resetInSeconds,
                triggeredScope: allowed ? undefined : rule.scope,
            };
        }
        catch (error) {
            this.logger.error(`Rate limit check failed for ${key}:`, error);
            return {
                allowed: true,
                current: 0,
                limit: rule.max,
                remaining: rule.max,
                resetInSeconds: rule.windowSeconds,
            };
        }
    }
    setRateLimitHeaders(response, result) {
        response.setHeader('X-RateLimit-Limit', result.limit);
        response.setHeader('X-RateLimit-Remaining', result.remaining);
        response.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + result.resetInSeconds);
        if (!result.allowed) {
            response.setHeader('Retry-After', result.resetInSeconds);
        }
    }
    getErrorMessage(profile, scope) {
        switch (profile) {
            case rate_limit_types_1.RateLimitProfile.AUTH:
            case rate_limit_types_1.RateLimitProfile.AUTH_SENSITIVE:
                return 'Too many authentication attempts. Please wait before trying again.';
            case rate_limit_types_1.RateLimitProfile.BULK:
                return 'Bulk operation limit reached. Please wait before submitting another bulk job.';
            case rate_limit_types_1.RateLimitProfile.CALENDAR:
                return 'Calendar availability requests limited. Please try again shortly.';
            case rate_limit_types_1.RateLimitProfile.REPORT:
                return 'Report generation limit reached. Please wait before generating more reports.';
            default:
                if (scope === rate_limit_types_1.RateLimitScope.TENANT) {
                    return 'Organization rate limit exceeded. Please coordinate with your team.';
                }
                return 'Rate limit exceeded. Please slow down your requests.';
        }
    }
    getClientIP(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        const realIP = request.headers['x-real-ip'];
        if (realIP) {
            return realIP;
        }
        return request.ip || request.connection?.remoteAddress || 'unknown';
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = RateLimitGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [core_1.Reflector,
        ioredis_1.default])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map