"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRetryOptions = void 0;
exports.defaultRetryOptions = {
    attempts: 5,
    backoff: {
        type: 'exponential',
        delay: 2000
    }
};
//# sourceMappingURL=retry.policy.js.map