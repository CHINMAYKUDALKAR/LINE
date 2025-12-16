import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
export declare class RateLimitGuard implements CanActivate {
    private reflector;
    private redis;
    private readonly logger;
    constructor(reflector: Reflector, redis: Redis);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private buildKey;
    private checkLimit;
    private setRateLimitHeaders;
    private getErrorMessage;
    private getClientIP;
}
