/**
 * Rate Limit Configuration
 * Defines limits for each profile per the SOW requirements
 */

import {
    RateLimitProfile,
    RateLimitProfileConfig,
    RateLimitScope,
} from './rate-limit.types';

/**
 * Rate limit configurations for all profiles
 */
export const RATE_LIMIT_CONFIGS: Record<RateLimitProfile, RateLimitProfileConfig> = {
    /**
     * AUTH: Login endpoint
     * 5 requests / minute / IP
     */
    [RateLimitProfile.AUTH]: {
        profile: RateLimitProfile.AUTH,
        description: 'Authentication endpoints (login)',
        rules: [
            { max: 5, windowSeconds: 60, scope: RateLimitScope.IP },
        ],
    },

    /**
     * AUTH_SENSITIVE: Password reset, OTP, verification
     * 3 requests / minute / IP
     */
    [RateLimitProfile.AUTH_SENSITIVE]: {
        profile: RateLimitProfile.AUTH_SENSITIVE,
        description: 'Sensitive auth endpoints (password reset, OTP)',
        rules: [
            { max: 3, windowSeconds: 60, scope: RateLimitScope.IP },
        ],
    },

    /**
     * READ: Standard read APIs
     * 300 requests / minute / user
     * 3000 requests / minute / tenant
     */
    [RateLimitProfile.READ]: {
        profile: RateLimitProfile.READ,
        description: 'Standard read APIs (GET candidates, interviews, calendar, messages)',
        rules: [
            { max: 300, windowSeconds: 60, scope: RateLimitScope.USER },
            { max: 3000, windowSeconds: 60, scope: RateLimitScope.TENANT },
        ],
    },

    /**
     * WRITE: Mutating APIs
     * 60 requests / minute / user
     * 600 requests / minute / tenant
     */
    [RateLimitProfile.WRITE]: {
        profile: RateLimitProfile.WRITE,
        description: 'Write/mutating APIs (create/update candidate, schedule interview)',
        rules: [
            { max: 60, windowSeconds: 60, scope: RateLimitScope.USER },
            { max: 600, windowSeconds: 60, scope: RateLimitScope.TENANT },
        ],
    },

    /**
     * CALENDAR: Expensive calendar operations
     * 60 requests / minute / user
     * 300 requests / minute / tenant
     */
    [RateLimitProfile.CALENDAR]: {
        profile: RateLimitProfile.CALENDAR,
        description: 'Calendar availability and suggestions (expensive)',
        rules: [
            { max: 60, windowSeconds: 60, scope: RateLimitScope.USER },
            { max: 300, windowSeconds: 60, scope: RateLimitScope.TENANT },
        ],
    },

    /**
     * BULK: Bulk operations
     * 5 jobs / hour / tenant
     */
    [RateLimitProfile.BULK]: {
        profile: RateLimitProfile.BULK,
        description: 'Bulk operations (bulk upload, bulk scheduling)',
        rules: [
            { max: 5, windowSeconds: 3600, scope: RateLimitScope.TENANT },
        ],
    },

    /**
     * REPORT: Reporting APIs
     * 20 requests / minute / user
     */
    [RateLimitProfile.REPORT]: {
        profile: RateLimitProfile.REPORT,
        description: 'Reporting and analytics APIs',
        rules: [
            { max: 20, windowSeconds: 60, scope: RateLimitScope.USER },
        ],
    },

    /**
     * WEBHOOK: High throughput webhook endpoints
     * 1000 requests / minute / tenant
     */
    [RateLimitProfile.WEBHOOK]: {
        profile: RateLimitProfile.WEBHOOK,
        description: 'Webhook endpoints (WhatsApp, SES, Twilio)',
        rules: [
            { max: 1000, windowSeconds: 60, scope: RateLimitScope.TENANT },
        ],
    },

    /**
     * NONE: No rate limiting
     */
    [RateLimitProfile.NONE]: {
        profile: RateLimitProfile.NONE,
        description: 'No rate limiting applied',
        rules: [],
    },
};

/**
 * Get configuration for a profile
 */
export function getRateLimitConfig(profile: RateLimitProfile): RateLimitProfileConfig {
    return RATE_LIMIT_CONFIGS[profile] || RATE_LIMIT_CONFIGS[RateLimitProfile.READ];
}
