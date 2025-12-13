export interface PasswordValidationResult {
    valid: boolean;
    errors: string[];
    score: number;
    suggestions: string[];
}
export interface PasswordPolicy {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
    disallowCommonPasswords: boolean;
}
export declare class PasswordPolicyService {
    validatePassword(password: string, policy?: Partial<PasswordPolicy>): PasswordValidationResult;
    enforcePolicy(password: string, policy?: Partial<PasswordPolicy>): void;
    getStrengthLabel(score: number): string;
    getDefaultPolicy(): PasswordPolicy;
}
export declare class CheckPasswordDto {
    password: string;
}
export interface CheckPasswordResponse {
    valid: boolean;
    errors: string[];
    score: number;
    strength: string;
    suggestions: string[];
    policy: PasswordPolicy;
}
