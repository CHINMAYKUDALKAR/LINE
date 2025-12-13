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
exports.BruteForceService = exports.BruteForceGuard = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60;
let BruteForceGuard = class BruteForceGuard {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = this.getClientIP(request);
        if (!this.isLoginEndpoint(request)) {
            return true;
        }
        const email = request.body?.email?.toLowerCase();
        if (!email) {
            return true;
        }
        const lockKey = `bruteforce:lock:${ip}:${email}`;
        const isLocked = await this.redis.get(lockKey);
        if (isLocked) {
            const ttl = await this.redis.ttl(lockKey);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: `Account temporarily locked due to too many failed login attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
                retryAfter: ttl,
                code: 'ACCOUNT_LOCKED',
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
    async recordFailedAttempt(ip, email) {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attempts = await this.redis.incr(attemptKey);
        if (attempts === 1) {
            await this.redis.expire(attemptKey, LOCKOUT_DURATION);
        }
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            await this.redis.set(lockKey, '1', 'EX', LOCKOUT_DURATION);
            await this.redis.del(attemptKey);
            return { locked: true, attempts };
        }
        return { locked: false, attempts };
    }
    async clearFailedAttempts(ip, email) {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(attemptKey);
    }
    async unlockAccount(ip, email) {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(lockKey, attemptKey);
    }
    async getLockStatus(ip, email) {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        const isLocked = await this.redis.get(lockKey);
        const ttl = isLocked ? await this.redis.ttl(lockKey) : 0;
        const attempts = parseInt(await this.redis.get(attemptKey) || '0');
        return { locked: !!isLocked, ttl, attempts };
    }
    isLoginEndpoint(request) {
        const path = request.route?.path || request.url;
        return (path.includes('/auth/login') ||
            path.includes('/auth/signin'));
    }
    getClientIP(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return request.ip || request.connection?.remoteAddress || 'unknown';
    }
};
exports.BruteForceGuard = BruteForceGuard;
exports.BruteForceGuard = BruteForceGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default])
], BruteForceGuard);
let BruteForceService = class BruteForceService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async recordFailedAttempt(ip, email) {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attempts = await this.redis.incr(attemptKey);
        if (attempts === 1) {
            await this.redis.expire(attemptKey, LOCKOUT_DURATION);
        }
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            await this.redis.set(lockKey, '1', 'EX', LOCKOUT_DURATION);
            await this.redis.del(attemptKey);
            return { locked: true, attempts, remainingAttempts: 0 };
        }
        return {
            locked: false,
            attempts,
            remainingAttempts: MAX_FAILED_ATTEMPTS - attempts
        };
    }
    async clearFailedAttempts(ip, email) {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(attemptKey);
    }
    async isLocked(ip, email) {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const isLocked = await this.redis.get(lockKey);
        const ttl = isLocked ? await this.redis.ttl(lockKey) : 0;
        return { locked: !!isLocked, ttl };
    }
    async unlockAccount(ip, email) {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(lockKey, attemptKey);
    }
};
exports.BruteForceService = BruteForceService;
exports.BruteForceService = BruteForceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default])
], BruteForceService);
//# sourceMappingURL=brute-force.guard.js.map