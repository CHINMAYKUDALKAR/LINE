export declare enum RateLimitProfile {
    AUTH = "AUTH",
    AUTH_SENSITIVE = "AUTH_SENSITIVE",
    READ = "READ",
    WRITE = "WRITE",
    CALENDAR = "CALENDAR",
    BULK = "BULK",
    REPORT = "REPORT",
    WEBHOOK = "WEBHOOK",
    NONE = "NONE"
}
export declare enum RateLimitScope {
    IP = "IP",
    USER = "USER",
    TENANT = "TENANT",
    USER_AND_TENANT = "USER_AND_TENANT"
}
export interface RateLimitRule {
    max: number;
    windowSeconds: number;
    scope: RateLimitScope;
}
export interface RateLimitProfileConfig {
    profile: RateLimitProfile;
    description: string;
    rules: RateLimitRule[];
}
export interface RateLimitCheckResult {
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
    resetInSeconds: number;
    triggeredScope?: RateLimitScope;
}
export declare const RATE_LIMIT_PROFILE_KEY = "rateLimit:profile";
export declare const RATE_LIMIT_SKIP_KEY = "rateLimit:skip";
