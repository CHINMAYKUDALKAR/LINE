import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import Redis from 'ioredis';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds

@Injectable()
export class BruteForceGuard implements CanActivate {
    constructor(@Inject('REDIS_CLIENT') private redis: Redis) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const ip = this.getClientIP(request);

        // Only apply to login endpoints
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
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: `Account temporarily locked due to too many failed login attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
                    retryAfter: ttl,
                    code: 'ACCOUNT_LOCKED',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }

    /**
     * Record a failed login attempt
     * Call this from auth service on login failure
     */
    async recordFailedAttempt(ip: string, email: string): Promise<{ locked: boolean; attempts: number }> {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;

        const attempts = await this.redis.incr(attemptKey);

        if (attempts === 1) {
            // Set expiry on first attempt (attempts reset after 15 minutes of no attempts)
            await this.redis.expire(attemptKey, LOCKOUT_DURATION);
        }

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            // Lock the account
            await this.redis.set(lockKey, '1', 'EX', LOCKOUT_DURATION);
            await this.redis.del(attemptKey); // Clear attempts counter
            return { locked: true, attempts };
        }

        return { locked: false, attempts };
    }

    /**
     * Clear failed attempts on successful login
     */
    async clearFailedAttempts(ip: string, email: string): Promise<void> {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(attemptKey);
    }

    /**
     * Unlock an account (admin action)
     */
    async unlockAccount(ip: string, email: string): Promise<void> {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(lockKey, attemptKey);
    }

    /**
     * Get lock status for an IP + email combination
     */
    async getLockStatus(ip: string, email: string): Promise<{ locked: boolean; ttl: number; attempts: number }> {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;

        const isLocked = await this.redis.get(lockKey);
        const ttl = isLocked ? await this.redis.ttl(lockKey) : 0;
        const attempts = parseInt(await this.redis.get(attemptKey) || '0');

        return { locked: !!isLocked, ttl, attempts };
    }

    private isLoginEndpoint(request: any): boolean {
        const path = request.route?.path || request.url;
        return (
            path.includes('/auth/login') ||
            path.includes('/auth/signin')
        );
    }

    private getClientIP(request: any): string {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return request.ip || request.connection?.remoteAddress || 'unknown';
    }
}

// Export as a service for injection into auth module
@Injectable()
export class BruteForceService {
    constructor(@Inject('REDIS_CLIENT') private redis: Redis) { }

    async recordFailedAttempt(ip: string, email: string): Promise<{ locked: boolean; attempts: number; remainingAttempts: number }> {
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

    async clearFailedAttempts(ip: string, email: string): Promise<void> {
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(attemptKey);
    }

    async isLocked(ip: string, email: string): Promise<{ locked: boolean; ttl: number }> {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const isLocked = await this.redis.get(lockKey);
        const ttl = isLocked ? await this.redis.ttl(lockKey) : 0;
        return { locked: !!isLocked, ttl };
    }

    async unlockAccount(ip: string, email: string): Promise<void> {
        const lockKey = `bruteforce:lock:${ip}:${email.toLowerCase()}`;
        const attemptKey = `bruteforce:attempts:${ip}:${email.toLowerCase()}`;
        await this.redis.del(lockKey, attemptKey);
    }
}
