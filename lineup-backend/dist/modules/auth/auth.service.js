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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const invitation_service_1 = require("./invitation.service");
const password_reset_service_1 = require("./password-reset.service");
const email_service_1 = require("../email/email.service");
const exceptions_1 = require("../../common/exceptions");
const bcrypt = __importStar(require("bcrypt"));
const token_util_1 = require("./utils/token.util");
const verification_util_1 = require("./utils/verification.util");
const ms_1 = __importDefault(require("ms"));
const brute_force_guard_1 = require("../../common/brute-force.guard");
const password_policy_service_1 = require("../../common/password-policy.service");
let AuthService = class AuthService {
    prisma;
    invitationService;
    passwordResetService;
    emailService;
    bruteForceService;
    passwordPolicyService;
    constructor(prisma, invitationService, passwordResetService, emailService, bruteForceService, passwordPolicyService) {
        this.prisma = prisma;
        this.invitationService = invitationService;
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
        this.bruteForceService = bruteForceService;
        this.passwordPolicyService = passwordPolicyService;
    }
    async signUpCreateTenant(dto, req) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
        if (existingUser) {
            throw new common_1.BadRequestException('An account with this email already exists');
        }
        this.passwordPolicyService.enforcePolicy(dto.password);
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
        const result = await this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.companyName,
                    domain: dto.domain || null,
                    trialActive: true,
                    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                },
            });
            const user = await tx.user.create({
                data: {
                    email: dto.email.toLowerCase(),
                    password: hashedPassword,
                    name: dto.name,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    tenantId: tenant.id,
                    lastLogin: new Date(),
                },
            });
            await tx.userTenant.create({
                data: {
                    userId: user.id,
                    tenantId: tenant.id,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                },
            });
            await tx.auditLog.create({
                data: {
                    tenantId: tenant.id,
                    userId: user.id,
                    action: 'tenant.created',
                    metadata: { tenantName: tenant.name, signupEmail: user.email },
                    ip: req?.ip,
                },
            });
            return { user, tenant };
        });
        const tokens = await this.generateTokensForUser(result.user.id, result.tenant.id, req);
        return {
            ...tokens,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                emailVerified: result.user.emailVerified,
            },
            activeTenantId: result.tenant.id,
            tenants: [{
                    id: result.tenant.id,
                    name: result.tenant.name,
                    role: 'ADMIN',
                    brandingLogoUrl: result.tenant.brandingLogoUrl,
                }],
        };
    }
    async register(dto) {
        if (dto.tenantId) {
            throw new common_1.BadRequestException('Direct tenant registration is not allowed. Please use an invitation link to join an existing organization.');
        }
        return this.signUpCreateTenant({
            email: dto.email,
            password: dto.password,
            name: dto.name || 'Admin',
            companyName: `${dto.email.split('@')[0]}'s Company`,
        });
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                userTenants: {
                    where: { status: 'ACTIVE' },
                    include: {
                        tenant: {
                            select: { id: true, name: true, brandingLogoUrl: true },
                        },
                    },
                },
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.status === 'INACTIVE') {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        return user;
    }
    async login(email, password, req) {
        const ip = req?.ip || 'unknown';
        const formattedEmail = email.toLowerCase();
        const { locked, ttl } = await this.bruteForceService.isLocked(ip, formattedEmail);
        if (locked) {
            throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`);
        }
        try {
            const user = await this.validateUser(email, password);
            await this.bruteForceService.clearFailedAttempts(ip, formattedEmail);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() },
            });
            let activeTenantId = null;
            const tenants = user.userTenants.map(ut => ({
                id: ut.tenant.id,
                name: ut.tenant.name,
                role: ut.role,
                brandingLogoUrl: ut.tenant.brandingLogoUrl,
            }));
            if (tenants.length === 1) {
                activeTenantId = tenants[0].id;
            }
            else if (tenants.length > 1) {
                activeTenantId = tenants[0].id;
            }
            const tokens = await this.generateTokensForUser(user.id, activeTenantId, req);
            if (activeTenantId) {
                await this.prisma.auditLog.create({
                    data: {
                        tenantId: activeTenantId,
                        userId: user.id,
                        action: 'user.login',
                        ip: req?.ip,
                    },
                });
            }
            return {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                },
                activeTenantId,
                tenants,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                const { locked: nowLocked, attempts } = await this.bruteForceService.recordFailedAttempt(ip, formattedEmail);
                if (nowLocked) {
                    throw new common_1.ForbiddenException('Account locked due to too many failed attempts. Please wait 15 minutes.');
                }
            }
            throw error;
        }
    }
    async switchTenant(userId, tenantId, req) {
        const userTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: { userId, tenantId },
            },
            include: {
                tenant: {
                    select: { id: true, name: true, brandingLogoUrl: true, brandingColors: true },
                },
                user: {
                    include: {
                        userTenants: {
                            where: { status: 'ACTIVE' },
                            include: {
                                tenant: { select: { id: true, name: true, brandingLogoUrl: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!userTenant || userTenant.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('You do not have access to this tenant');
        }
        const tokens = await this.generateTokensForUser(userId, tenantId, req);
        const tenants = userTenant.user.userTenants.map(ut => ({
            id: ut.tenant.id,
            name: ut.tenant.name,
            role: ut.role,
            brandingLogoUrl: ut.tenant.brandingLogoUrl,
        }));
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'tenant.switched',
                metadata: { newTenantId: tenantId },
                ip: req?.ip,
            },
        });
        return {
            ...tokens,
            user: {
                id: userTenant.user.id,
                email: userTenant.user.email,
                name: userTenant.user.name,
                emailVerified: userTenant.user.emailVerified,
            },
            activeTenantId: tenantId,
            tenants,
        };
    }
    async acceptInvite(dto, req) {
        const invite = await this.invitationService.getInviteByToken(dto.token);
        const inviteId = await this.invitationService.verifyToken(dto.token);
        let user = await this.prisma.user.findUnique({
            where: { email: invite.email.toLowerCase() },
        });
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
        if (user) {
            const existingUserTenant = await this.prisma.userTenant.findUnique({
                where: { userId_tenantId: { userId: user.id, tenantId: invite.tenant.id } },
            });
            if (existingUserTenant) {
                throw new common_1.BadRequestException('You are already a member of this tenant');
            }
            if (dto.name) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        name: dto.name,
                        status: 'ACTIVE',
                    },
                });
            }
        }
        else {
            user = await this.prisma.user.create({
                data: {
                    email: invite.email.toLowerCase(),
                    password: hashedPassword,
                    name: dto.name || null,
                    role: invite.role,
                    status: 'ACTIVE',
                    tenantId: invite.tenant.id,
                },
            });
        }
        await this.prisma.userTenant.create({
            data: {
                userId: user.id,
                tenantId: invite.tenant.id,
                role: invite.role,
                status: 'ACTIVE',
                invitedBy: invite.id,
                invitedAt: new Date(),
            },
        });
        await this.invitationService.markInviteUsed(inviteId);
        await this.prisma.auditLog.create({
            data: {
                tenantId: invite.tenant.id,
                userId: user.id,
                action: 'user.invitation_accepted',
                metadata: { invitationId: invite.id, role: invite.role },
                ip: req?.ip,
            },
        });
        const tokens = await this.generateTokensForUser(user.id, invite.tenant.id, req);
        const userTenants = await this.prisma.userTenant.findMany({
            where: { userId: user.id, status: 'ACTIVE' },
            include: { tenant: { select: { id: true, name: true, brandingLogoUrl: true } } },
        });
        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
            activeTenantId: invite.tenant.id,
            tenants: userTenants.map(ut => ({
                id: ut.tenant.id,
                name: ut.tenant.name,
                role: ut.role,
                brandingLogoUrl: ut.tenant.brandingLogoUrl,
            })),
        };
    }
    async refresh(refreshToken, req) {
        try {
            const decoded = (0, token_util_1.verifyRefreshToken)(refreshToken);
            const userId = decoded.sub;
            const record = await this.prisma.refreshToken.findFirst({
                where: { userId, revoked: false },
                orderBy: { createdAt: 'desc' },
            });
            if (!record)
                throw new common_1.UnauthorizedException('Refresh token not found');
            const valid = await bcrypt.compare(refreshToken, record.tokenHash);
            if (!valid) {
                await this.prisma.refreshToken.updateMany({
                    where: { userId },
                    data: { revoked: true },
                });
                throw new common_1.UnauthorizedException('Invalid refresh token - all sessions revoked');
            }
            if (new Date() > record.expiresAt) {
                throw new common_1.UnauthorizedException('Refresh token expired');
            }
            await this.prisma.refreshToken.update({
                where: { id: record.id },
                data: { revoked: true },
            });
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userTenants: {
                        where: { status: 'ACTIVE' },
                        include: {
                            tenant: { select: { id: true, name: true, brandingLogoUrl: true } },
                        },
                    },
                },
            });
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            let activeTenantId = record.activeTenantId;
            if (!activeTenantId && user.userTenants.length > 0) {
                activeTenantId = user.userTenants[0].tenantId;
            }
            const tokens = await this.generateTokensForUser(userId, activeTenantId, req);
            const tenants = user.userTenants.map(ut => ({
                id: ut.tenant.id,
                name: ut.tenant.name,
                role: ut.role,
                brandingLogoUrl: ut.tenant.brandingLogoUrl,
            }));
            return {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                },
                activeTenantId,
                tenants,
            };
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true },
        });
        return { success: true };
    }
    async forgotPassword(email) {
        return this.passwordResetService.initiateReset(email);
    }
    async validateResetToken(token) {
        return this.passwordResetService.validateToken(token);
    }
    async resetPassword(token, newPassword) {
        return this.passwordResetService.executeReset(token, newPassword);
    }
    async generateTokensForUser(userId, activeTenantId, req) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userTenants: {
                    where: { status: 'ACTIVE' },
                },
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const roles = {};
        for (const ut of user.userTenants) {
            roles[ut.tenantId] = ut.role;
        }
        const payload = {
            sub: userId,
            email: user.email,
            activeTenantId,
            roles,
        };
        const accessToken = (0, token_util_1.signAccessToken)(payload);
        const refreshToken = (0, token_util_1.signRefreshToken)(payload);
        const hashedRefresh = await bcrypt.hash(refreshToken, 10);
        const ttl = process.env.REFRESH_TOKEN_TTL || '14d';
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: hashedRefresh,
                activeTenantId,
                revoked: false,
                expiresAt: new Date(Date.now() + (0, ms_1.default)(ttl)),
                userAgent: req?.headers?.['user-agent']?.substring(0, 255),
                ipAddress: req?.ip,
            },
        });
        return { accessToken, refreshToken };
    }
    async sendVerificationEmail(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (user.emailVerified)
            throw new exceptions_1.BusinessException('Email already verified');
        const token = (0, verification_util_1.generateVerificationToken)();
        const expiry = (0, verification_util_1.generateTokenExpiry)();
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                verificationToken: token,
                verificationExpiry: expiry,
            },
        });
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
        try {
            await this.emailService.sendMail(null, {
                to: user.email,
                template: 'verification',
                context: {
                    name: user.name || 'User',
                    verificationUrl,
                    expiryHours: 24,
                },
            });
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
        return { success: true, message: 'Verification email sent' };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findUnique({
            where: { verificationToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        if (user.emailVerified) {
            throw new exceptions_1.BusinessException('Email already verified');
        }
        if ((0, verification_util_1.isTokenExpired)(user.verificationExpiry)) {
            throw new exceptions_1.BusinessException('Verification token has expired');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationExpiry: null,
            },
        });
        return { success: true, message: 'Email verified successfully' };
    }
    async resendVerification(email) {
        const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        if (user.emailVerified)
            throw new exceptions_1.BusinessException('Email already verified');
        return this.sendVerificationEmail(user.id);
    }
    async createInvitation(tenantId, email, role, createdBy) {
        return this.invitationService.createInvite(tenantId, email, role, createdBy);
    }
    async getInvitePreview(token) {
        return this.invitationService.getInviteByToken(token);
    }
    async listPendingInvitations(tenantId) {
        return this.invitationService.listPendingInvites(tenantId);
    }
    async cancelInvitation(tenantId, inviteId) {
        return this.invitationService.cancelInvite(tenantId, inviteId);
    }
    async checkPassword(password) {
        return this.passwordPolicyService.validatePassword(password);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        invitation_service_1.InvitationService,
        password_reset_service_1.PasswordResetService,
        email_service_1.EmailService,
        brute_force_guard_1.BruteForceService,
        password_policy_service_1.PasswordPolicyService])
], AuthService);
//# sourceMappingURL=auth.service.js.map