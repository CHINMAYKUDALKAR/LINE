import { RateLimitProfile, RateLimitProfileConfig } from './rate-limit.types';
export declare const RATE_LIMIT_CONFIGS: Record<RateLimitProfile, RateLimitProfileConfig>;
export declare function getRateLimitConfig(profile: RateLimitProfile): RateLimitProfileConfig;
