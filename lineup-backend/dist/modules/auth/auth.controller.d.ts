import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PasswordCheckDto } from './dto/password-check.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
export declare class AuthController {
    private svc;
    constructor(svc: AuthService);
    signup(dto: SignupDto, req: express.Request, res: express.Response): Promise<{
        accessToken: string;
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
            role: string;
            brandingLogoUrl?: string | null;
        }[];
    }>;
    register(dto: RegisterDto): Promise<import("./auth.service").AuthResponse>;
    checkPassword(dto: PasswordCheckDto): Promise<import("../../common/password-policy.service").PasswordValidationResult>;
    login(dto: LoginDto, req: express.Request, res: express.Response): Promise<{
        accessToken: string;
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
            role: string;
            brandingLogoUrl?: string | null;
        }[];
    }>;
    refresh(dto: RefreshDto, req: express.Request, res: express.Response): Promise<{
        accessToken: string;
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
    }>;
    logout(req: any, res: express.Response): Promise<{
        success: boolean;
    }>;
    switchTenant(req: any, dto: SwitchTenantDto, res: express.Response): Promise<{
        accessToken: string;
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
            role: string;
            brandingLogoUrl?: string | null;
        }[];
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
    acceptInvite(dto: AcceptInviteDto, req: express.Request, res: express.Response): Promise<{
        accessToken: string;
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
            role: string;
            brandingLogoUrl?: string | null;
        }[];
    }>;
    createInvitation(req: any, dto: CreateInvitationDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        expiresAt: Date;
        inviteUrl: string;
    }>;
    listInvitations(req: any): Promise<{
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
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        valid: boolean;
        email?: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendVerification(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerification(dto: ResendVerificationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private setRefreshTokenCookie;
}
