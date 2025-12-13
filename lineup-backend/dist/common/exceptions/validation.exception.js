"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const common_1 = require("@nestjs/common");
class ValidationException extends common_1.HttpException {
    constructor(errors) {
        super({
            statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'Validation Failed',
            message: 'Input validation failed',
            errors,
            timestamp: new Date().toISOString(),
        }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=validation.exception.js.map