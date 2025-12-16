import { PrismaService } from '../../common/prisma.service';
import { InvitationService } from './invitation.service';
import { PasswordResetService } from './password-reset.service';
import { EmailService } from '../email/email.service';
import { SignupDto } from './dto/signup.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Request } from 'express';
import { BruteForceService } from '../../common/brute-force.guard';
import { PasswordPolicyService } from '../../common/password-policy.service';
export interface TokenPayload {
    sub: string;
    email: string;
    activeTenantId: string | null;
    roles: Record<string, string>;
    iat?: number;
    exp?: number;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        emailVerified: boolean;
    };
    activeTenantId: string | null;
    tenants: Array<{
        id: string;
        name: string;
        role: string;
        brandingLogoUrl?: string | null;
    }>;
}
export declare class AuthService {
    private prisma;
    private invitationService;
    private passwordResetService;
    private emailService;
    private bruteForceService;
    private passwordPolicyService;
    constructor(prisma: PrismaService, invitationService: InvitationService, passwordResetService: PasswordResetService, emailService: EmailService, bruteForceService: BruteForceService, passwordPolicyService: PasswordPolicyService);
    signUpCreateTenant(dto: SignupDto, req?: Request): Promise<AuthResponse>;
    register(dto: {
        email: string;
        password: string;
        name?: string;
        tenantId?: string;
    }): Promise<AuthResponse>;
    validateUser(email: string, password: string): Promise<{
        userTenants: ({
            tenant: {
                id: string;
                name: string;
                brandingLogoUrl: string | null;
            };
        } & {
            id: string;
            userId: string;
            tenantId: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserTenantStatus;
            invitedBy: string | null;
            invitedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        id: string;
        tenantId: string | null;
        email: string;
        password: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
        invitationToken: string | null;
        invitationExpiresAt: Date | null;
        teamIds: string[];
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(email: string, password: string, req?: Request): Promise<AuthResponse>;
    switchTenant(userId: string, tenantId: string, req?: Request): Promise<AuthResponse>;
    acceptInvite(dto: AcceptInviteDto, req?: Request): Promise<AuthResponse>;
    refresh(refreshToken: string, req?: Request): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            emailVerified: boolean;
        };
        activeTenantId: string | null;
        tenants: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            brandingLogoUrl: string | null;
        }[];
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        valid: boolean;
        email?: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokensForUser;
    sendVerificationEmail(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createInvitation(tenantId: string, email: string, role: any, createdBy?: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        expiresAt: Date;
        inviteUrl: string;
    }>;
    getInvitePreview(token: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        expiresAt: Date;
        tenant: {
            id: string;
            name: string;
            brandingLogoUrl: string | null;
            brandingColors: import(".prisma/client").Prisma.JsonValue;
        };
    }>;
    listPendingInvitations(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        tokenHash: string;
        expiresAt: Date;
        createdBy: string | null;
        usedAt: Date | null;
        createdAt: Date;
    }[]>;
    cancelInvitation(tenantId: string, inviteId: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        tokenHash: string;
        expiresAt: Date;
        createdBy: string | null;
        usedAt: Date | null;
        createdAt: Date;
    }>;
    checkPassword(password: string): Promise<import("../../common/password-policy.service").PasswordValidationResult>;
}
