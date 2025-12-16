"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_CONFIGS = void 0;
exports.getRateLimitConfig = getRateLimitConfig;
const rate_limit_types_1 = require("./rate-limit.types");
exports.RATE_LIMIT_CONFIGS = {
    [rate_limit_types_1.RateLimitProfile.AUTH]: {
        profile: rate_limit_types_1.RateLimitProfile.AUTH,
        description: 'Authentication endpoints (login)',
        rules: [
            { max: 5, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.IP },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.AUTH_SENSITIVE]: {
        profile: rate_limit_types_1.RateLimitProfile.AUTH_SENSITIVE,
        description: 'Sensitive auth endpoints (password reset, OTP)',
        rules: [
            { max: 3, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.IP },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.READ]: {
        profile: rate_limit_types_1.RateLimitProfile.READ,
        description: 'Standard read APIs (GET candidates, interviews, calendar, messages)',
        rules: [
            { max: 300, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.USER },
            { max: 3000, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.TENANT },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.WRITE]: {
        profile: rate_limit_types_1.RateLimitProfile.WRITE,
        description: 'Write/mutating APIs (create/update candidate, schedule interview)',
        rules: [
            { max: 60, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.USER },
            { max: 600, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.TENANT },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.CALENDAR]: {
        profile: rate_limit_types_1.RateLimitProfile.CALENDAR,
        description: 'Calendar availability and suggestions (expensive)',
        rules: [
            { max: 60, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.USER },
            { max: 300, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.TENANT },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.BULK]: {
        profile: rate_limit_types_1.RateLimitProfile.BULK,
        description: 'Bulk operations (bulk upload, bulk scheduling)',
        rules: [
            { max: 5, windowSeconds: 3600, scope: rate_limit_types_1.RateLimitScope.TENANT },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.REPORT]: {
        profile: rate_limit_types_1.RateLimitProfile.REPORT,
        description: 'Reporting and analytics APIs',
        rules: [
            { max: 20, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.USER },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.WEBHOOK]: {
        profile: rate_limit_types_1.RateLimitProfile.WEBHOOK,
        description: 'Webhook endpoints (WhatsApp, SES, Twilio)',
        rules: [
            { max: 1000, windowSeconds: 60, scope: rate_limit_types_1.RateLimitScope.TENANT },
        ],
    },
    [rate_limit_types_1.RateLimitProfile.NONE]: {
        profile: rate_limit_types_1.RateLimitProfile.NONE,
        description: 'No rate limiting applied',
        rules: [],
    },
};
function getRateLimitConfig(profile) {
    return exports.RATE_LIMIT_CONFIGS[profile] || exports.RATE_LIMIT_CONFIGS[rate_limit_types_1.RateLimitProfile.READ];
}
//# sourceMappingURL=rate-limit.config.js.map