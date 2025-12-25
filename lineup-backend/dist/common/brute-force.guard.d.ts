import { CanActivate, ExecutionContext } from '@nestjs/common';
import Redis from 'ioredis';
export declare class BruteForceService {
    private redis;
    constructor(redis: Redis);
    recordFailedAttempt(ip: string, email: string): Promise<{
        locked: boolean;
        attempts: number;
        remainingAttempts: number;
    }>;
    clearFailedAttempts(ip: string, email: string): Promise<void>;
    isLocked(ip: string, email: string): Promise<{
        locked: boolean;
        ttl: number;
    }>;
    getLockStatus(ip: string, email: string): Promise<{
        locked: boolean;
        ttl: number;
        attempts: number;
    }>;
    unlockAccount(ip: string, email: string): Promise<void>;
    getClientIP(request: any): string;
    private getLockKey;
    private getAttemptKey;
}
export declare class BruteForceGuard implements CanActivate {
    private bruteForceService;
    constructor(bruteForceService: BruteForceService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private isLoginEndpoint;
}
