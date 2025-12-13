"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const team_role_util_1 = require("./utils/team-role.util");
let TeamsService = class TeamsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTeam(tenantId, userId, dto) {
        const existing = await this.prisma.team.findUnique({
            where: { tenantId_name: { tenantId, name: dto.name } },
        });
        if (existing)
            throw new common_1.BadRequestException('Team name already exists in this tenant');
        if (dto.leadId) {
            const lead = await this.prisma.user.findFirst({
                where: { id: dto.leadId, tenantId },
            });
            if (!lead)
                throw new common_1.BadRequestException('Team lead not found');
        }
        const team = await this.prisma.team.create({
            data: {
                name: dto.name,
                description: dto.description,
                leadId: dto.leadId,
                tenantId,
            },
        });
        if (dto.leadId) {
            await this.prisma.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: dto.leadId,
                    tenantId,
                    role: 'TEAM_LEAD',
                },
            });
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'team.created',
                metadata: { teamId: team.id, name: dto.name, leadId: dto.leadId },
            },
        });
        return team;
    }
    async listTeams(tenantId, dto) {
        const page = dto.page || 1;
        const perPage = dto.perPage || 20;
        const where = { tenantId };
        if (dto.q)
            where.name = { contains: dto.q, mode: 'insensitive' };
        const [total, data] = await Promise.all([
            this.prisma.team.count({ where }),
            this.prisma.team.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { members: true } } },
            }),
        ]);
        return {
            data: data.map(team => ({ ...team, memberCount: team._count.members, _count: undefined })),
            meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
        };
    }
    async getTeam(tenantId, teamId) {
        const team = await this.prisma.team.findFirst({
            where: { id: teamId, tenantId },
            include: { _count: { select: { members: true } } },
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        return { ...team, memberCount: team._count.members, _count: undefined };
    }
    async updateTeam(tenantId, userId, teamId, dto) {
        const team = await this.prisma.team.findFirst({ where: { id: teamId, tenantId } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        if (dto.name && dto.name !== team.name) {
            const existing = await this.prisma.team.findUnique({
                where: { tenantId_name: { tenantId, name: dto.name } },
            });
            if (existing)
                throw new common_1.BadRequestException('Team name already exists');
        }
        if (dto.leadId) {
            const isMember = await this.prisma.teamMember.findFirst({
                where: { teamId, userId: dto.leadId },
            });
            if (!isMember)
                throw new common_1.BadRequestException('Team lead must be a member of the team');
        }
        const updated = await this.prisma.team.update({
            where: { id: teamId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.leadId !== undefined && { leadId: dto.leadId }),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'team.updated',
                metadata: { teamId, changes: JSON.parse(JSON.stringify(dto)) },
            },
        });
        return updated;
    }
    async deleteTeam(tenantId, userId, teamId) {
        const team = await this.prisma.team.findFirst({ where: { id: teamId, tenantId } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        await this.prisma.team.delete({ where: { id: teamId } });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'team.deleted',
                metadata: { teamId, name: team.name },
            },
        });
        return { success: true, message: 'Team deleted successfully' };
    }
    async addMember(tenantId, userId, teamId, dto) {
        const team = await this.prisma.team.findFirst({ where: { id: teamId, tenantId } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        const user = await this.prisma.user.findFirst({ where: { id: dto.userId, tenantId } });
        if (!user)
            throw new common_1.BadRequestException('User not found in this tenant');
        const existing = await this.prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: dto.userId } },
        });
        if (existing)
            throw new common_1.BadRequestException('User is already a team member');
        const member = await this.prisma.teamMember.create({
            data: {
                teamId,
                userId: dto.userId,
                tenantId,
                role: dto.role || 'TEAM_MEMBER',
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'team.member.added',
                metadata: { teamId, addedUserId: dto.userId, role: dto.role },
            },
        });
        return member;
    }
    async removeMember(tenantId, userId, teamId, memberId) {
        const member = await this.prisma.teamMember.findFirst({
            where: { id: memberId, teamId, tenantId },
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        await this.prisma.teamMember.delete({ where: { id: memberId } });
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        if (team?.leadId === member.userId) {
            await this.prisma.team.update({
                where: { id: teamId },
                data: { leadId: null },
            });
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'team.member.removed',
                metadata: { teamId, removedUserId: member.userId },
            },
        });
        return { success: true, message: 'Member removed successfully' };
    }
    async getTeamMembers(tenantId, teamId) {
        const team = await this.prisma.team.findFirst({ where: { id: teamId, tenantId } });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        const members = await this.prisma.teamMember.findMany({
            where: { teamId, tenantId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });
        return members.map(m => ({
            id: m.id,
            userId: m.userId,
            teamRole: m.role,
            effectiveRole: (0, team_role_util_1.effectiveRole)(m.user.role, m.role),
            user: m.user,
            createdAt: m.createdAt,
        }));
    }
    async getAvailableInterviewers(teamId, dateRange) {
        const members = await this.prisma.teamMember.findMany({
            where: { teamId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });
        return members
            .filter(m => m.user.status === 'ACTIVE' &&
            (m.user.role === 'INTERVIEWER' || m.user.role === 'MANAGER' || m.role === 'TEAM_LEAD'))
            .map(m => m.user);
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map