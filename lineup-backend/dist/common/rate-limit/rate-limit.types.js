"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_SKIP_KEY = exports.RATE_LIMIT_PROFILE_KEY = exports.RateLimitScope = exports.RateLimitProfile = void 0;
var RateLimitProfile;
(function (RateLimitProfile) {
    RateLimitProfile["AUTH"] = "AUTH";
    RateLimitProfile["AUTH_SENSITIVE"] = "AUTH_SENSITIVE";
    RateLimitProfile["READ"] = "READ";
    RateLimitProfile["WRITE"] = "WRITE";
    RateLimitProfile["CALENDAR"] = "CALENDAR";
    RateLimitProfile["BULK"] = "BULK";
    RateLimitProfile["REPORT"] = "REPORT";
    RateLimitProfile["WEBHOOK"] = "WEBHOOK";
    RateLimitProfile["NONE"] = "NONE";
})(RateLimitProfile || (exports.RateLimitProfile = RateLimitProfile = {}));
var RateLimitScope;
(function (RateLimitScope) {
    RateLimitScope["IP"] = "IP";
    RateLimitScope["USER"] = "USER";
    RateLimitScope["TENANT"] = "TENANT";
    RateLimitScope["USER_AND_TENANT"] = "USER_AND_TENANT";
})(RateLimitScope || (exports.RateLimitScope = RateLimitScope = {}));
exports.RATE_LIMIT_PROFILE_KEY = 'rateLimit:profile';
exports.RATE_LIMIT_SKIP_KEY = 'rateLimit:skip';
//# sourceMappingURL=rate-limit.types.js.map