import Redis from 'ioredis';
export declare const cache: Redis;
export declare function getCached<T>(key: string): Promise<T | null>;
export declare function setCached(key: string, value: any, ttlSec?: number): Promise<void>;
export declare function invalidateCache(pattern: string): Promise<void>;
