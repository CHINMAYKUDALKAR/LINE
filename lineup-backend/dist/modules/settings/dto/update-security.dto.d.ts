export declare class UpdateSecurityPolicyDto {
    ipAllowlistEnabled?: boolean;
    allowedIPs?: string[];
    passwordMinLength?: number;
    passwordRequireUppercase?: boolean;
    passwordRequireLowercase?: boolean;
    passwordRequireNumber?: boolean;
    passwordRequireSymbol?: boolean;
    passwordMaxAgeDays?: number;
    maxConcurrentSessions?: number;
    sessionTimeoutMinutes?: number;
}
