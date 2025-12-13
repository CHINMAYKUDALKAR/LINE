import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
export declare const RateLimit: (max: number, windowSeconds?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => any;
export declare const SkipRateLimit: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => any;
export declare class RateLimiterGuard implements CanActivate {
    private reflector;
    private redis;
    constructor(reflector: Reflector, redis: Redis);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getClientIP;
}
