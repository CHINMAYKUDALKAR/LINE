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
exports.HiringStagesService = exports.DEFAULT_HIRING_STAGES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
exports.DEFAULT_HIRING_STAGES = [
    { name: 'Applied', key: 'APPLIED', order: 1, color: '#6366f1', isDefault: true },
    { name: 'Screening', key: 'SCREENING', order: 2, color: '#8b5cf6' },
    { name: 'Interview 1', key: 'INTERVIEW_1', order: 3, color: '#0ea5e9' },
    { name: 'Interview 2', key: 'INTERVIEW_2', order: 4, color: '#06b6d4' },
    { name: 'HR Round', key: 'HR_ROUND', order: 5, color: '#10b981' },
    { name: 'Offer', key: 'OFFER', order: 6, color: '#22c55e' },
    { name: 'Hired', key: 'HIRED', order: 7, color: '#16a34a', isTerminal: true },
    { name: 'Rejected', key: 'REJECTED', order: 99, color: '#dc2626', isTerminal: true },
];
let HiringStagesService = class HiringStagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId, includeInactive = false) {
        const where = { tenantId };
        if (!includeInactive) {
            where.isActive = true;
        }
        return this.prisma.hiringStage.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }
    async get(tenantId, id) {
        const stage = await this.prisma.hiringStage.findFirst({
            where: { id, tenantId },
        });
        if (!stage) {
            throw new common_1.NotFoundException('Hiring stage not found');
        }
        return stage;
    }
    async getByKey(tenantId, key) {
        return this.prisma.hiringStage.findFirst({
            where: { tenantId, key, isActive: true },
        });
    }
    async validate(tenantId, key) {
        const stage = await this.getByKey(tenantId, key);
        return !!stage;
    }
    async getDefault(tenantId) {
        const stage = await this.prisma.hiringStage.findFirst({
            where: { tenantId, isDefault: true, isActive: true },
        });
        return stage || (await this.list(tenantId))[0];
    }
    async create(tenantId, userId, dto) {
        const existing = await this.prisma.hiringStage.findFirst({
            where: { tenantId, key: dto.key },
        });
        if (existing) {
            throw new common_1.ConflictException(`Stage with key "${dto.key}" already exists`);
        }
        const maxOrder = await this.prisma.hiringStage.aggregate({
            where: { tenantId },
            _max: { order: true },
        });
        const nextOrder = (maxOrder._max.order || 0) + 1;
        if (dto.isDefault) {
            await this.prisma.hiringStage.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const stage = await this.prisma.hiringStage.create({
            data: {
                tenantId,
                name: dto.name,
                key: dto.key,
                order: nextOrder,
                color: dto.color || null,
                isDefault: dto.isDefault || false,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'HIRING_STAGE_CREATE',
                metadata: { stageId: stage.id, key: stage.key, name: stage.name },
            },
        });
        return stage;
    }
    async update(tenantId, userId, id, dto) {
        const stage = await this.get(tenantId, id);
        if (dto.isDefault) {
            await this.prisma.hiringStage.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const updated = await this.prisma.hiringStage.update({
            where: { id },
            data: {
                name: dto.name,
                color: dto.color,
                isActive: dto.isActive,
                isDefault: dto.isDefault,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'HIRING_STAGE_UPDATE',
                metadata: { stageId: id, changes: dto },
            },
        });
        return updated;
    }
    async reorder(tenantId, userId, stageIds) {
        const stages = await this.prisma.hiringStage.findMany({
            where: { tenantId, id: { in: stageIds } },
        });
        if (stages.length !== stageIds.length) {
            throw new common_1.BadRequestException('Invalid stage IDs');
        }
        await this.prisma.$transaction(stageIds.map((id, index) => this.prisma.hiringStage.update({
            where: { id },
            data: { order: index + 1 },
        })));
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'HIRING_STAGE_REORDER',
                metadata: { newOrder: stageIds },
            },
        });
        return this.list(tenantId, true);
    }
    async toggle(tenantId, userId, id) {
        const stage = await this.get(tenantId, id);
        if (stage.isActive) {
            const activeCount = await this.prisma.hiringStage.count({
                where: { tenantId, isActive: true },
            });
            if (activeCount <= 1) {
                throw new common_1.BadRequestException('Cannot deactivate the last active stage');
            }
        }
        if (stage.isActive && stage.isDefault) {
            throw new common_1.BadRequestException('Cannot deactivate the default stage. Set another stage as default first.');
        }
        const updated = await this.prisma.hiringStage.update({
            where: { id },
            data: { isActive: !stage.isActive },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'HIRING_STAGE_TOGGLE',
                metadata: { stageId: id, isActive: updated.isActive },
            },
        });
        return updated;
    }
    async delete(tenantId, userId, id) {
        const stage = await this.get(tenantId, id);
        const candidateCount = await this.prisma.candidate.count({
            where: { tenantId, stage: stage.key },
        });
        if (candidateCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete stage "${stage.name}" - it is used by ${candidateCount} candidate(s). ` +
                `Move them to another stage first.`);
        }
        const interviewCount = await this.prisma.interview.count({
            where: { tenantId, stage: stage.key },
        });
        if (interviewCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete stage "${stage.name}" - it is used by ${interviewCount} interview(s).`);
        }
        const activeCount = await this.prisma.hiringStage.count({
            where: { tenantId, isActive: true },
        });
        if (stage.isActive && activeCount <= 1) {
            throw new common_1.BadRequestException('Cannot delete the last active stage');
        }
        await this.prisma.hiringStage.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'HIRING_STAGE_DELETE',
                metadata: { stageId: id, key: stage.key, name: stage.name },
            },
        });
        return { success: true };
    }
    async seedDefaultStages(tenantId) {
        const existing = await this.prisma.hiringStage.count({ where: { tenantId } });
        if (existing > 0) {
            return;
        }
        await this.prisma.hiringStage.createMany({
            data: exports.DEFAULT_HIRING_STAGES.map(s => ({
                tenantId,
                name: s.name,
                key: s.key,
                order: s.order,
                color: s.color,
                isDefault: s.isDefault || false,
                isTerminal: s.isTerminal || false,
            })),
        });
    }
};
exports.HiringStagesService = HiringStagesService;
exports.HiringStagesService = HiringStagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HiringStagesService);
//# sourceMappingURL=hiring-stages.service.js.map