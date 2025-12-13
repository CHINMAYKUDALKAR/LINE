"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse = this.buildErrorResponse(exception, request, status);
        this.logError(exception, request, status);
        response.status(status).json(errorResponse);
    }
    buildErrorResponse(exception, request, status) {
        const baseResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };
        if (exception instanceof common_1.HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object') {
                return {
                    ...baseResponse,
                    ...exceptionResponse,
                };
            }
            return {
                ...baseResponse,
                error: exception.name,
                message: exceptionResponse,
            };
        }
        const message = exception instanceof Error ? exception.message : 'Internal server error';
        return {
            ...baseResponse,
            error: 'Internal Server Error',
            message,
            code: 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' &&
                exception instanceof Error && {
                stack: exception.stack,
            }),
        };
    }
    logError(exception, request, status) {
        const { method, url, body, query, params, headers } = request;
        const userAgent = headers['user-agent'] || 'Unknown';
        const ip = headers['x-forwarded-for'] || request.ip;
        const errorContext = {
            statusCode: status,
            method,
            url,
            ip,
            userAgent,
            body: this.sanitizeBody(body),
            query,
            params,
        };
        if (exception instanceof Error) {
            this.logger.error(`${method} ${url} - ${exception.message}`, exception.stack, JSON.stringify(errorContext, null, 2));
        }
        else {
            this.logger.error(`${method} ${url} - Unknown error`, JSON.stringify(errorContext, null, 2));
        }
    }
    sanitizeBody(body) {
        if (!body)
            return body;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken'];
        sensitiveFields.forEach((field) => {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        });
        return sanitized;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=exceptions.filter.js.map