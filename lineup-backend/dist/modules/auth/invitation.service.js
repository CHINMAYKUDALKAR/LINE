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
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const email_service_1 = require("../email/email.service");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
let InvitationService = class InvitationService {
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
    async createInvite(tenantId, email, role = 'RECRUITER', createdBy, expiresInDays = 7) {
        const existingInvite = await this.prisma.invitation.findFirst({
            where: {
                tenantId,
                email: email.toLowerCase(),
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        if (existingInvite) {
            throw new common_1.BadRequestException('An active invitation already exists for this email');
        }
        const existingUserTenant = await this.prisma.userTenant.findFirst({
            where: {
                tenantId,
                user: { email: email.toLowerCase() },
            },
        });
        if (existingUserTenant) {
            throw new common_1.BadRequestException('User is already a member of this tenant');
        }
        const token = this.generateToken();
        const tokenHash = await this.hashToken(token);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        const invitation = await this.prisma.invitation.create({
            data: {
                tenantId,
                email: email.toLowerCase(),
                role,
                tokenHash,
                expiresAt,
                createdBy,
            },
            include: {
                tenant: {
                    select: { name: true, brandingLogoUrl: true },
                },
            },
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteUrl = `${frontendUrl}/invite?token=${token}`;
        try {
            await this.emailService.sendMail(tenantId, {
                to: email,
                template: 'invitation',
                context: {
                    tenantName: invitation.tenant.name,
                    inviteUrl,
                    expiresInDays,
                },
            });
        }
        catch (error) {
            console.error('Failed to send invitation email:', error);
        }
        return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            expiresAt: invitation.expiresAt,
            inviteUrl,
        };
    }
    async getInviteByToken(token) {
        const invitations = await this.prisma.invitation.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        brandingLogoUrl: true,
                        brandingColors: true,
                    },
                },
            },
        });
        for (const invitation of invitations) {
            const isMatch = await bcrypt.compare(token, invitation.tokenHash);
            if (isMatch) {
                return {
                    id: invitation.id,
                    email: invitation.email,
                    role: invitation.role,
                    expiresAt: invitation.expiresAt,
                    tenant: invitation.tenant,
                };
            }
        }
        throw new common_1.BadRequestException('Invalid or expired invitation token');
    }
    async verifyToken(token) {
        const invitations = await this.prisma.invitation.findMany({
            where: {
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
        });
        for (const invitation of invitations) {
            const isMatch = await bcrypt.compare(token, invitation.tokenHash);
            if (isMatch) {
                return invitation.id;
            }
        }
        throw new common_1.BadRequestException('Invalid or expired invitation token');
    }
    async markInviteUsed(inviteId) {
        return this.prisma.invitation.update({
            where: { id: inviteId },
            data: { usedAt: new Date() },
        });
    }
    async listPendingInvites(tenantId) {
        return this.prisma.invitation.findMany({
            where: {
                tenantId,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async cancelInvite(tenantId, inviteId) {
        const invitation = await this.prisma.invitation.findFirst({
            where: { id: inviteId, tenantId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.usedAt) {
            throw new common_1.BadRequestException('This invitation has already been used');
        }
        return this.prisma.invitation.update({
            where: { id: inviteId },
            data: { expiresAt: new Date() },
        });
    }
    getInviteEmailTemplate(tenantName, inviteUrl, expiresInDays) {
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #1f2937;">You're invited to Lineup!</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p><strong>${tenantName}</strong> has invited you to join their team on Lineup, the smart interview management platform.</p>
            <p>Click the button below to accept your invitation and create your account:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">This invitation will expire in ${expiresInDays} days.</p>
        </div>
        <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>© ${new Date().getFullYear()} Lineup. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }
};
exports.InvitationService = InvitationService;
exports.InvitationService = InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InvitationService);
//# sourceMappingURL=invitation.service.js.map