"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckPasswordDto = exports.PasswordPolicyService = void 0;
const common_1 = require("@nestjs/common");
const DEFAULT_POLICY = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSymbol: true,
    disallowCommonPasswords: true,
};
const COMMON_PASSWORDS = [
    'password', 'password1', 'password123', '12345678', '123456789',
    'qwerty', 'qwerty123', 'letmein', 'welcome', 'admin', 'admin123',
    'pass1234', 'changeme', 'iloveyou', 'sunshine', 'princess',
    'football', 'baseball', 'master', 'dragon', 'michael', 'shadow',
    'monkey', 'jennifer', 'abc123', '111111', '1234567890',
];
let PasswordPolicyService = class PasswordPolicyService {
    validatePassword(password, policy = {}) {
        const effectivePolicy = { ...DEFAULT_POLICY, ...policy };
        const errors = [];
        const suggestions = [];
        let score = 0;
        if (password.length < effectivePolicy.minLength) {
            errors.push(`Password must be at least ${effectivePolicy.minLength} characters long`);
        }
        else {
            score += 20;
        }
        if (password.length > effectivePolicy.maxLength) {
            errors.push(`Password must be at most ${effectivePolicy.maxLength} characters long`);
        }
        if (effectivePolicy.requireUppercase) {
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            else {
                score += 15;
            }
        }
        if (effectivePolicy.requireLowercase) {
            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            else {
                score += 15;
            }
        }
        if (effectivePolicy.requireNumber) {
            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            else {
                score += 15;
            }
        }
        if (effectivePolicy.requireSymbol) {
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
                errors.push('Password must contain at least one special character (!@#$%^&*...)');
            }
            else {
                score += 20;
            }
        }
        if (effectivePolicy.disallowCommonPasswords) {
            if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
                errors.push('Password is too common. Please choose a stronger password');
                score = Math.max(0, score - 50);
            }
        }
        if (password.length >= 12) {
            score += 10;
        }
        if (password.length >= 16) {
            score += 5;
        }
        if (/(.)\1{2,}/.test(password)) {
            suggestions.push('Avoid repeating the same character multiple times');
            score = Math.max(0, score - 10);
        }
        if (/(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(password)) {
            suggestions.push('Avoid sequential characters like "123" or "abc"');
            score = Math.max(0, score - 10);
        }
        if (password.length < 12) {
            suggestions.push('Consider using a longer password for better security');
        }
        if (!/[!@#$%^&*]/.test(password) && !/[0-9]/.test(password)) {
            suggestions.push('Add numbers and special characters for stronger security');
        }
        return {
            valid: errors.length === 0,
            errors,
            score: Math.min(100, Math.max(0, score)),
            suggestions,
        };
    }
    enforcePolicy(password, policy) {
        const result = this.validatePassword(password, policy);
        if (!result.valid) {
            throw new common_1.BadRequestException({
                statusCode: 400,
                message: 'Password does not meet security requirements',
                errors: result.errors,
                code: 'INVALID_PASSWORD',
            });
        }
    }
    getStrengthLabel(score) {
        if (score >= 80)
            return 'strong';
        if (score >= 60)
            return 'good';
        if (score >= 40)
            return 'fair';
        if (score >= 20)
            return 'weak';
        return 'very weak';
    }
    getDefaultPolicy() {
        return { ...DEFAULT_POLICY };
    }
};
exports.PasswordPolicyService = PasswordPolicyService;
exports.PasswordPolicyService = PasswordPolicyService = __decorate([
    (0, common_1.Injectable)()
], PasswordPolicyService);
class CheckPasswordDto {
    password;
}
exports.CheckPasswordDto = CheckPasswordDto;
//# sourceMappingURL=password-policy.service.js.map