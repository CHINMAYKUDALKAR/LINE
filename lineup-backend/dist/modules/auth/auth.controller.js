"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const express = __importStar(require("express"));
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const signup_dto_1 = require("./dto/signup.dto");
const refresh_dto_1 = require("./dto/refresh.dto");
const switch_tenant_dto_1 = require("./dto/switch-tenant.dto");
const accept_invite_dto_1 = require("./dto/accept-invite.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const create_invitation_dto_1 = require("./dto/create-invitation.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const password_check_dto_1 = require("./dto/password-check.dto");
const resend_verification_dto_1 = require("./dto/resend-verification.dto");
const jwt_guard_1 = require("./guards/jwt.guard");
const rbac_guard_1 = require("./guards/rbac.guard");
const roles_decorator_1 = require("./decorators/roles.decorator");
const rate_limit_1 = require("../../common/rate-limit");
let AuthController = class AuthController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async signup(dto, req, res) {
        const result = await this.svc.signUpCreateTenant(dto, req);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }
    register(dto) {
        return this.svc.register(dto);
    }
    checkPassword(dto) {
        return this.svc.checkPassword(dto.password);
    }
    async login(dto, req, res) {
        const result = await this.svc.login(dto.email, dto.password, req);
        this.setRefreshTokenCookie(res, result.refreshToken, dto.rememberMe);
        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }
    async refresh(dto, req, res) {
        const refreshToken = req.cookies?.refreshToken || dto.refreshToken;
        if (!refreshToken) {
            throw new Error('No refresh token provided');
        }
        const result = await this.svc.refresh(refreshToken, req);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }
    async logout(req, res) {
        const result = await this.svc.logout(req.user.sub);
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
        return result;
    }
    async switchTenant(req, dto, res) {
        const result = await this.svc.switchTenant(req.user.sub, dto.tenantId, req);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }
    getInvitePreview(token) {
        return this.svc.getInvitePreview(token);
    }
    async acceptInvite(dto, req, res) {
        const result = await this.svc.acceptInvite(dto, req);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }
    async createInvitation(req, dto) {
        return this.svc.createInvitation(req.tenantId, dto.email, dto.role || 'RECRUITER', req.user.sub);
    }
    listInvitations(req) {
        return this.svc.listPendingInvitations(req.tenantId);
    }
    forgotPassword(dto) {
        return this.svc.forgotPassword(dto.email);
    }
    validateResetToken(token) {
        return this.svc.validateResetToken(token);
    }
    resetPassword(dto) {
        return this.svc.resetPassword(dto.token, dto.newPassword);
    }
    sendVerification(req) {
        return this.svc.sendVerificationEmail(req.user.sub);
    }
    verifyEmail(dto) {
        return this.svc.verifyEmail(dto.token);
    }
    resendVerification(dto) {
        return this.svc.resendVerification(dto.email);
    }
    setRefreshTokenCookie(res, refreshToken, rememberMe) {
        const maxAge = rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000;
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge,
            path: '/',
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant and admin user (Trial signup)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tenant and user created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email already exists' }),
    (0, swagger_1.ApiBody)({ type: signup_dto_1.SignupDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, swagger_1.ApiOperation)({ summary: 'Legacy register endpoint - use /signup instead' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email already exists' }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('password/check'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check password strength against policy' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password validation result' }),
    (0, swagger_1.ApiBody)({ type: password_check_dto_1.PasswordCheckDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_check_dto_1.PasswordCheckDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "checkPassword", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful, returns access token and tenant list' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    (0, swagger_1.ApiBody)({ type: refresh_dto_1.RefreshDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_dto_1.RefreshDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Logout and revoke refresh tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('switch-tenant'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Switch to a different tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant switched, new tokens returned' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'No access to requested tenant' }),
    (0, swagger_1.ApiBody)({ type: switch_tenant_dto_1.SwitchTenantDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, switch_tenant_dto_1.SwitchTenantDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "switchTenant", null);
__decorate([
    (0, common_1.Get)('invite/:token'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get invitation preview (tenant branding)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation details returned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    (0, swagger_1.ApiParam)({ name: 'token', description: 'Invitation token from email link' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getInvitePreview", null);
__decorate([
    (0, common_1.Post)('accept-invite'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Accept invitation and create/link account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account created/linked, logged in' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    (0, swagger_1.ApiBody)({ type: accept_invite_dto_1.AcceptInviteDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [accept_invite_dto_1.AcceptInviteDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)('invitations'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invitation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Invitation created and email sent' }),
    (0, swagger_1.ApiBody)({ type: create_invitation_dto_1.CreateInvitationDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_invitation_dto_1.CreateInvitationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Get)('invitations'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'List pending invitations for tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of pending invitations' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "listInvitations", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH_SENSITIVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reset email sent if account exists' }),
    (0, swagger_1.ApiBody)({ type: forgot_password_dto_1.ForgotPasswordDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Get)('reset-password/validate'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, swagger_1.ApiOperation)({ summary: 'Validate password reset token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token validity status' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "validateResetToken", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH_SENSITIVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    (0, swagger_1.ApiBody)({ type: reset_password_dto_1.ResetPasswordDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('send-verification'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Send email verification link' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification email sent' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email already verified' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "sendVerification", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email address with token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH_SENSITIVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resend verification email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification email resent' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User not found or email already verified' }),
    (0, swagger_1.ApiBody)({ type: resend_verification_dto_1.ResendVerificationDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_verification_dto_1.ResendVerificationDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resendVerification", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('api/v1/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map