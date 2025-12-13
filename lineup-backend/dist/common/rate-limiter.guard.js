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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterGuard = exports.SkipRateLimit = exports.RateLimit = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ioredis_1 = __importDefault(require("ioredis"));
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 100;
const RateLimit = (max, windowSeconds) => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('rateLimit:max', max, descriptor?.value || target);
        if (windowSeconds) {
            Reflect.defineMetadata('rateLimit:window', windowSeconds, descriptor?.value || target);
        }
        return descriptor || target;
    };
};
exports.RateLimit = RateLimit;
const SkipRateLimit = () => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('rateLimit:skip', true, descriptor?.value || target);
        return descriptor || target;
    };
};
exports.SkipRateLimit = SkipRateLimit;
let RateLimiterGuard = class RateLimiterGuard {
    reflector;
    redis;
    constructor(reflector, redis) {
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(context) {
        const handler = context.getHandler();
        const classRef = context.getClass();
        const skipRateLimit = this.reflector.get('rateLimit:skip', handler);
        if (skipRateLimit) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const ip = this.getClientIP(request);
        const route = `${request.method}:${request.route?.path || request.url}`;
        const tenantId = request.tenantId || 'global';
        const maxRequests = this.reflector.get('rateLimit:max', handler) || RATE_LIMIT_MAX;
        const windowSeconds = this.reflector.get('rateLimit:window', handler) || RATE_LIMIT_WINDOW;
        const key = `${tenantId}:${ip}:${route}`;
        try {
            const current = await this.redis.incr(key);
            if (current === 1) {
                await this.redis.expire(key, windowSeconds);
            }
            const ttl = await this.redis.ttl(key);
            const response = context.switchToHttp().getResponse();
            response.setHeader('X-RateLimit-Limit', maxRequests);
            response.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
            response.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);
            if (current > maxRequests) {
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. Please try again later.',
                    retryAfter: ttl,
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            return true;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Rate limiter Redis error:', error.message);
            return true;
        }
    }
    getClientIP(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return request.ip || request.connection?.remoteAddress || 'unknown';
    }
};
exports.RateLimiterGuard = RateLimiterGuard;
exports.RateLimiterGuard = RateLimiterGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [core_1.Reflector,
        ioredis_1.default])
], RateLimiterGuard);
//# sourceMappingURL=rate-limiter.guard.js.map