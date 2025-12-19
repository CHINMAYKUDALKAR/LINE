import { SettingsService } from './settings.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSsoDto } from './dto/update-sso.dto';
import { UpdateSmtpDto } from './dto/update-smtp.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
import { CreateApiKeyDto } from './dto/create-apikey.dto';
import { RevokeApiKeyDto } from './dto/revoke-apikey.dto';
import { UpdateSecurityPolicyDto } from './dto/update-security.dto';
export declare class SettingsController {
    private svc;
    constructor(svc: SettingsService);
    getSettings(req: any): Promise<string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray>;
    updateBranding(req: any, dto: UpdateBrandingDto): Promise<any>;
    updateSso(req: any, dto: UpdateSsoDto): Promise<any>;
    updateSmtp(req: any, dto: UpdateSmtpDto): Promise<{
        success: boolean;
    }>;
    testSmtp(req: any, dto: TestSmtpDto): Promise<{
        success: boolean;
    }>;
    createApiKey(req: any, dto: CreateApiKeyDto): Promise<{
        id: string;
        name: string;
        key: string;
    }>;
    listApiKeys(req: any): Promise<{
        name: string;
        id: string;
        active: boolean;
        createdAt: Date;
        scopes: string[];
        lastUsed: Date | null;
    }[]>;
    revokeApiKey(req: any, dto: RevokeApiKeyDto): Promise<{
        success: boolean;
    }>;
    getSecurityPolicy(req: any): Promise<{
        id: string;
        tenantId: string;
        ipAllowlistEnabled: boolean;
        allowedIPs: string[];
        passwordMinLength: number;
        passwordRequireUppercase: boolean;
        passwordRequireLowercase: boolean;
        passwordRequireNumber: boolean;
        passwordRequireSymbol: boolean;
        passwordMaxAgeDays: number | null;
        maxConcurrentSessions: number | null;
        sessionTimeoutMinutes: number | null;
        enforce2FA: boolean;
        enforce2FAForAdmins: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateSecurityPolicy(req: any, dto: UpdateSecurityPolicyDto): Promise<{
        id: string;
        tenantId: string;
        ipAllowlistEnabled: boolean;
        allowedIPs: string[];
        passwordMinLength: number;
        passwordRequireUppercase: boolean;
        passwordRequireLowercase: boolean;
        passwordRequireNumber: boolean;
        passwordRequireSymbol: boolean;
        passwordMaxAgeDays: number | null;
        maxConcurrentSessions: number | null;
        sessionTimeoutMinutes: number | null;
        enforce2FA: boolean;
        enforce2FAForAdmins: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
