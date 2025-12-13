import { CanActivate, ExecutionContext } from '@nestjs/common';
import Redis from 'ioredis';
export declare class BruteForceGuard implements CanActivate {
    private redis;
    constructor(redis: Redis);
    canActivate(context: ExecutionContext): Promise<boolean>;
    recordFailedAttempt(ip: string, email: string): Promise<{
        locked: boolean;
        attempts: number;
    }>;
    clearFailedAttempts(ip: string, email: string): Promise<void>;
    unlockAccount(ip: string, email: string): Promise<void>;
    getLockStatus(ip: string, email: string): Promise<{
        locked: boolean;
        ttl: number;
        attempts: number;
    }>;
    private isLoginEndpoint;
    private getClientIP;
}
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
    unlockAccount(ip: string, email: string): Promise<void>;
}
