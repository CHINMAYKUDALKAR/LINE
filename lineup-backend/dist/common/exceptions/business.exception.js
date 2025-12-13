"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    constructor(message, code) {
        super({
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            error: 'Business Rule Violation',
            message,
            code: code || 'BUSINESS_ERROR',
            timestamp: new Date().toISOString(),
        }, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.BusinessException = BusinessException;
//# sourceMappingURL=business.exception.js.map