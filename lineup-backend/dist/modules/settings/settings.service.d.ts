import { PrismaService } from '../../common/prisma.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSsoDto } from './dto/update-sso.dto';
import { UpdateSmtpDto } from './dto/update-smtp.dto';
import { CreateApiKeyDto } from './dto/create-apikey.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(tenantId: string): Promise<string | number | true | import(".prisma/client").Prisma.JsonObject | import(".prisma/client").Prisma.JsonArray>;
    updateBranding(tenantId: string, userId: string, dto: UpdateBrandingDto): Promise<any>;
    updateSso(tenantId: string, userId: string, dto: UpdateSsoDto): Promise<any>;
    updateSmtp(tenantId: string, userId: string, dto: UpdateSmtpDto): Promise<{
        success: boolean;
    }>;
    testSmtp(tenantId: string, dto: TestSmtpDto): Promise<{
        success: boolean;
    }>;
    createApiKey(tenantId: string, userId: string, dto: CreateApiKeyDto): Promise<{
        id: string;
        name: string;
        key: string;
    }>;
    listApiKeys(tenantId: string): Promise<{
        name: string;
        id: string;
        active: boolean;
        createdAt: Date;
        scopes: string[];
        lastUsed: Date | null;
    }[]>;
    revokeApiKey(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getSecurityPolicy(tenantId: string): Promise<{
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
    updateSecurityPolicy(tenantId: string, userId: string, dto: any): Promise<{
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
