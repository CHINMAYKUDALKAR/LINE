import { Controller, Post, Body, UseGuards, Req, Get, Query, Param, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
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
import { JwtAuthGuard } from './guards/jwt.guard';
import { RbacGuard } from './guards/rbac.guard';
import { Roles } from './decorators/roles.decorator';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
    constructor(private svc: AuthService) { }

    // ============================================
    // PUBLIC AUTH ENDPOINTS
    // ============================================

    @Post('signup')
    @ApiOperation({ summary: 'Create a new tenant and admin user (Trial signup)' })
    @ApiResponse({ status: 201, description: 'Tenant and user created successfully' })
    @ApiResponse({ status: 400, description: 'Email already exists' })
    @ApiBody({ type: SignupDto })
    async signup(@Body() dto: SignupDto, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.svc.signUpCreateTenant(dto, req);

        // Set refresh token as HTTPOnly cookie
        this.setRefreshTokenCookie(res, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }

    @Post('register')
    @ApiOperation({ summary: 'Legacy register endpoint - use /signup instead' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Email already exists' })
    @ApiBody({ type: RegisterDto })
    register(@Body() dto: RegisterDto) {
        return this.svc.register(dto);
    }

    @Post('password/check')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Check password strength against policy' })
    @ApiResponse({ status: 200, description: 'Password validation result' })
    @ApiBody({ type: PasswordCheckDto })
    checkPassword(@Body() dto: PasswordCheckDto) {
        return this.svc.checkPassword(dto.password);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Login successful, returns access token and tenant list' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiBody({ type: LoginDto })
    async login(@Body() dto: LoginDto, @Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.svc.login(dto.email, dto.password, req);

        // Set refresh token as HTTPOnly cookie
        this.setRefreshTokenCookie(res, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    @ApiBody({ type: RefreshDto })
    async refresh(
        @Body() dto: RefreshDto,
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        // Try to get refresh token from cookie first, then from body
        const refreshToken = req.cookies?.refreshToken || dto.refreshToken;

        if (!refreshToken) {
            throw new Error('No refresh token provided');
        }

        const result = await this.svc.refresh(refreshToken, req);

        // Set new refresh token as HTTPOnly cookie
        this.setRefreshTokenCookie(res, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Logout and revoke refresh tokens' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async logout(@Req() req: any, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.svc.logout(req.user.sub);

        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return result;
    }

    // ============================================
    // TENANT SWITCHING
    // ============================================

    @Post('switch-tenant')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Switch to a different tenant' })
    @ApiResponse({ status: 200, description: 'Tenant switched, new tokens returned' })
    @ApiResponse({ status: 403, description: 'No access to requested tenant' })
    @ApiBody({ type: SwitchTenantDto })
    async switchTenant(
        @Req() req: any,
        @Body() dto: SwitchTenantDto,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.svc.switchTenant(req.user.sub, dto.tenantId, req);

        // Set new refresh token as HTTPOnly cookie
        this.setRefreshTokenCookie(res, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }

    // ============================================
    // INVITATION ENDPOINTS
    // ============================================

    @Get('invite/:token')
    @ApiOperation({ summary: 'Get invitation preview (tenant branding)' })
    @ApiResponse({ status: 200, description: 'Invitation details returned' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    @ApiParam({ name: 'token', description: 'Invitation token from email link' })
    getInvitePreview(@Param('token') token: string) {
        return this.svc.getInvitePreview(token);
    }

    @Post('accept-invite')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Accept invitation and create/link account' })
    @ApiResponse({ status: 200, description: 'Account created/linked, logged in' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    @ApiBody({ type: AcceptInviteDto })
    async acceptInvite(
        @Body() dto: AcceptInviteDto,
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const result = await this.svc.acceptInvite(dto, req);

        // Set refresh token as HTTPOnly cookie
        this.setRefreshTokenCookie(res, result.refreshToken);

        return {
            accessToken: result.accessToken,
            user: result.user,
            activeTenantId: result.activeTenantId,
            tenants: result.tenants,
        };
    }

    @Post('invitations')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Create a new invitation' })
    @ApiResponse({ status: 201, description: 'Invitation created and email sent' })
    @ApiBody({ type: CreateInvitationDto })
    async createInvitation(@Req() req: any, @Body() dto: CreateInvitationDto) {
        return this.svc.createInvitation(
            req.tenantId,
            dto.email,
            dto.role || 'RECRUITER',
            req.user.sub,
        );
    }

    @Get('invitations')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'List pending invitations for tenant' })
    @ApiResponse({ status: 200, description: 'List of pending invitations' })
    listInvitations(@Req() req: any) {
        return this.svc.listPendingInvitations(req.tenantId);
    }

    // ============================================
    // PASSWORD RESET
    // ============================================

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset email' })
    @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
    @ApiBody({ type: ForgotPasswordDto })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.svc.forgotPassword(dto.email);
    }

    @Get('reset-password/validate')
    @ApiOperation({ summary: 'Validate password reset token' })
    @ApiResponse({ status: 200, description: 'Token validity status' })
    validateResetToken(@Query('token') token: string) {
        return this.svc.validateResetToken(token);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    @ApiBody({ type: ResetPasswordDto })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.svc.resetPassword(dto.token, dto.newPassword);
    }

    // ============================================
    // EMAIL VERIFICATION (kept from original)
    // ============================================

    @Post('send-verification')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Send email verification link' })
    @ApiResponse({ status: 200, description: 'Verification email sent' })
    @ApiResponse({ status: 400, description: 'Email already verified' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    sendVerification(@Req() req: any) {
        return this.svc.sendVerificationEmail(req.user.sub);
    }

    @Get('verify-email')
    @ApiOperation({ summary: 'Verify email address with token' })
    @ApiResponse({ status: 200, description: 'Email verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    verifyEmail(@Query() dto: VerifyEmailDto) {
        return this.svc.verifyEmail(dto.token);
    }

    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend verification email' })
    @ApiResponse({ status: 200, description: 'Verification email resent' })
    @ApiResponse({ status: 400, description: 'User not found or email already verified' })
    @ApiBody({ type: ResendVerificationDto })
    resendVerification(@Body() dto: ResendVerificationDto) {
        return this.svc.resendVerification(dto.email);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private setRefreshTokenCookie(res: express.Response, refreshToken: string) {
        const maxAge = 14 * 24 * 60 * 60 * 1000; // 14 days
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction, // HTTPS only in production
            sameSite: isProduction ? 'strict' : 'lax', // 'lax' for dev to work across ports
            maxAge,
            path: '/',
        });
    }
}
