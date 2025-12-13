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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const email_service_1 = require("../email/email.service");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
let PasswordResetService = class PasswordResetService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async hashToken(token) {
        return bcrypt.hash(token, 10);
    }
    async initiateReset(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return { success: true, message: 'If an account with that email exists, a reset link has been sent.' };
        }
        await this.prisma.passwordReset.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { expiresAt: new Date() },
        });
        const token = this.generateToken();
        const tokenHash = await this.hashToken(token);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.passwordReset.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
        try {
            await this.emailService.sendMail(null, {
                to: email,
                template: 'password-reset',
                context: {
                    userName: user.name || 'there',
                    resetUrl,
                },
            });
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
        return { success: true, message: 'If an account with that email exists, a reset link has been sent.' };
    }
    async validateToken(token) {
        const resets = await this.prisma.passwordReset.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: { select: { email: true } },
            },
        });
        for (const reset of resets) {
            const isMatch = await bcrypt.compare(token, reset.tokenHash);
            if (isMatch) {
                return { valid: true, email: reset.user.email };
            }
        }
        return { valid: false };
    }
    async executeReset(token, newPassword) {
        const resets = await this.prisma.passwordReset.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });
        let matchedReset = null;
        for (const reset of resets) {
            const isMatch = await bcrypt.compare(token, reset.tokenHash);
            if (isMatch) {
                matchedReset = reset;
                break;
            }
        }
        if (!matchedReset) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: matchedReset.userId },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordReset.update({
                where: { id: matchedReset.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId: matchedReset.userId },
                data: { revoked: true },
            }),
        ]);
        await this.prisma.auditLog.create({
            data: {
                userId: matchedReset.userId,
                action: 'password.reset',
                metadata: { method: 'email_token' },
            },
        });
        return { success: true, message: 'Password has been reset successfully. Please log in with your new password.' };
    }
    getResetEmailTemplate(userName, resetUrl) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .content { background: #f9fafb; border-radius: 8px; padding: 30px; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #1f2937;">Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your Lineup password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <div class="warning">
                <strong>⏰ This link will expire in 1 hour.</strong>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Lineup. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map