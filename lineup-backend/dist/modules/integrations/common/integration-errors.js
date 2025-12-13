"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationMappingError = exports.IntegrationNetworkError = exports.IntegrationRateLimitError = exports.IntegrationAuthError = void 0;
class IntegrationAuthError extends Error {
}
exports.IntegrationAuthError = IntegrationAuthError;
class IntegrationRateLimitError extends Error {
}
exports.IntegrationRateLimitError = IntegrationRateLimitError;
class IntegrationNetworkError extends Error {
}
exports.IntegrationNetworkError = IntegrationNetworkError;
class IntegrationMappingError extends Error {
}
exports.IntegrationMappingError = IntegrationMappingError;
//# sourceMappingURL=integration-errors.js.map