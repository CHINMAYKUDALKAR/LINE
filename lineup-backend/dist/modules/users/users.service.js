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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../common/prisma.service");
const user_role_util_1 = require("./utils/user-role.util");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    invitationQueue;
    constructor(prisma, invitationQueue) {
        this.prisma = prisma;
        this.invitationQueue = invitationQueue;
    }
    async inviteUser(tenantId, adminId, dto) {
        const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
        if (!admin)
            throw new common_1.BadRequestException('Admin user not found');
        (0, user_role_util_1.validateRoleChange)(admin.role, dto.role);
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('User with this email already exists');
        const token = (0, user_role_util_1.generateInvitationToken)();
        const hashedToken = (0, user_role_util_1.hashInvitationToken)(token);
        const expiry = (0, user_role_util_1.getInvitationExpiry)();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                role: dto.role,
                tenantId,
                status: 'INVITED',
                invitationToken: hashedToken,
                invitationExpiresAt: expiry,
                teamIds: dto.teamIds || [],
                password: '',
            },
        });
        await this.invitationQueue.add('send-invitation', {
            tenantId,
            userId: user.id,
            email: dto.email,
            name: dto.name,
            invitationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invite?token=${token}`,
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId: adminId,
                action: 'user.invited',
                metadata: { invitedUserId: user.id, email: dto.email, role: dto.role },
            },
        });
        return { success: true, userId: user.id, message: 'Invitation sent successfully' };
    }
    async acceptInvite(dto) {
        const hashedToken = (0, user_role_util_1.hashInvitationToken)(dto.token);
        const user = await this.prisma.user.findUnique({ where: { invitationToken: hashedToken } });
        if (!user)
            throw new common_1.BadRequestException('Invalid invitation token');
        if (user.status === 'ACTIVE')
            throw new common_1.BadRequestException('Invitation already accepted');
        if ((0, user_role_util_1.isInvitationExpired)(user.invitationExpiresAt))
            throw new common_1.BadRequestException('Invitation has expired');
        const hashedPassword = await bcrypt.hash(dto.password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                status: 'ACTIVE',
                invitationToken: null,
                invitationExpiresAt: null,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId: user.tenantId,
                userId: user.id,
                action: 'user.activated',
                metadata: { email: user.email },
            },
        });
        return { success: true, message: 'Account activated successfully. You can now log in.' };
    }
    async listUsers(tenantId, dto) {
        const page = dto.page || 1;
        const perPage = dto.perPage || 20;
        const where = { tenantId };
        if (dto.q) {
            where.OR = [
                { name: { contains: dto.q, mode: 'insensitive' } },
                { email: { contains: dto.q, mode: 'insensitive' } },
            ];
        }
        if (dto.role)
            where.role = dto.role;
        if (dto.status)
            where.status = dto.status;
        const [total, data] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    lastLogin: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
        ]);
        return {
            data,
            meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
        };
    }
    async getUser(tenantId, userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenantId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                teamIds: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateUser(tenantId, adminId, userId, dto) {
        const [admin, user] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: adminId } }),
            this.prisma.user.findFirst({ where: { id: userId, tenantId } }),
        ]);
        if (!admin)
            throw new common_1.BadRequestException('Admin user not found');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.role && dto.role !== user.role)
            (0, user_role_util_1.validateRoleChange)(admin.role, dto.role);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.role && { role: dto.role }),
                ...(dto.status && { status: dto.status }),
                ...(dto.teamIds && { teamIds: dto.teamIds }),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId: adminId,
                action: 'user.updated',
                metadata: { targetUserId: userId, changes: JSON.parse(JSON.stringify(dto)) },
            },
        });
        return updated;
    }
    async activateUser(tenantId, adminId, userId) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId: adminId,
                action: 'user.activated',
                metadata: { targetUserId: userId },
            },
        });
        return { success: true, message: 'User activated' };
    }
    async deactivateUser(tenantId, adminId, userId) {
        const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'INACTIVE' },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId: adminId,
                action: 'user.deactivated',
                metadata: { targetUserId: userId },
            },
        });
        return { success: true, message: 'User deactivated' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('user-invitations')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], UsersService);
//# sourceMappingURL=users.service.js.map