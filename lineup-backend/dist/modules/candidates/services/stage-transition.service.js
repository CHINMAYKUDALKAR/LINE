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
exports.StageTransitionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let StageTransitionService = class StageTransitionService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async transitionStage(tenantId, request) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: request.candidateId, tenantId, deletedAt: null },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        const previousStage = candidate.stage;
        if (previousStage === request.newStage) {
            return {
                success: true,
                candidateId: request.candidateId,
                previousStage,
                newStage: request.newStage,
                transitionType: 'SAME',
            };
        }
        const isCurrentlyTerminal = await this.isTerminalStage(tenantId, previousStage);
        if (isCurrentlyTerminal) {
            throw new common_1.ForbiddenException(`Cannot change stage: Candidate is in terminal stage "${previousStage}". ` +
                `Terminal stages (e.g., HIRED, REJECTED) are final.`);
        }
        const targetStage = await this.prisma.hiringStage.findFirst({
            where: { tenantId, key: request.newStage, isActive: true },
        });
        if (!targetStage) {
            throw new common_1.BadRequestException(`Invalid stage: "${request.newStage}" does not exist or is inactive`);
        }
        const warnings = [];
        let transitionType = 'FORWARD';
        const currentStageOrder = await this.getStageOrder(tenantId, previousStage);
        const targetStageOrder = targetStage.order;
        if (targetStage.isTerminal) {
            transitionType = 'TERMINAL';
        }
        else if (targetStageOrder < currentStageOrder) {
            if (!request.allowOverride && request.source === 'USER') {
                warnings.push(`Backward transition from "${previousStage}" to "${request.newStage}"`);
            }
            transitionType = request.allowOverride ? 'OVERRIDE' : 'BACKWARD';
        }
        if (transitionType === 'OVERRIDE' && !request.reason) {
            throw new common_1.BadRequestException('Reason is required for override transitions');
        }
        await this.prisma.candidate.update({
            where: { id: request.candidateId },
            data: { stage: request.newStage },
        });
        await this.prisma.candidateStageHistory.create({
            data: {
                tenantId,
                candidateId: request.candidateId,
                previousStage,
                newStage: request.newStage,
                source: request.source,
                triggeredBy: request.triggeredBy,
                actorId: request.actorId || null,
                reason: request.reason || null,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId: request.actorId || null,
                action: 'CANDIDATE_STAGE_TRANSITION',
                metadata: {
                    candidateId: request.candidateId,
                    previousStage,
                    newStage: request.newStage,
                    source: request.source,
                    triggeredBy: request.triggeredBy,
                    transitionType,
                    reason: request.reason,
                },
            },
        });
        this.eventEmitter.emit('candidate.stage.changed', {
            tenantId,
            candidateId: request.candidateId,
            previousStage,
            newStage: request.newStage,
            source: request.source,
            triggeredBy: request.triggeredBy,
        });
        return {
            success: true,
            candidateId: request.candidateId,
            previousStage,
            newStage: request.newStage,
            transitionType,
            warnings: warnings.length > 0 ? warnings : undefined,
        };
    }
    async rejectCandidate(tenantId, candidateId, reason, actorId) {
        if (!reason || reason.trim().length < 3) {
            throw new common_1.BadRequestException('Rejection reason is required (minimum 3 characters)');
        }
        return this.transitionStage(tenantId, {
            candidateId,
            newStage: 'REJECTED',
            source: 'USER',
            triggeredBy: 'REJECTION',
            actorId,
            reason,
        });
    }
    async isTerminalStage(tenantId, stageKey) {
        const stage = await this.prisma.hiringStage.findFirst({
            where: { tenantId, key: stageKey },
            select: { isTerminal: true },
        });
        return stage?.isTerminal || false;
    }
    async getStageOrder(tenantId, stageKey) {
        const stage = await this.prisma.hiringStage.findFirst({
            where: { tenantId, key: stageKey },
            select: { order: true },
        });
        return stage?.order || 0;
    }
    async validateTransition(tenantId, fromStage, toStage) {
        const isFromTerminal = await this.isTerminalStage(tenantId, fromStage);
        if (isFromTerminal) {
            return { valid: false, reason: `Cannot transition from terminal stage "${fromStage}"` };
        }
        const targetStage = await this.prisma.hiringStage.findFirst({
            where: { tenantId, key: toStage, isActive: true },
        });
        if (!targetStage) {
            return { valid: false, reason: `Stage "${toStage}" does not exist or is inactive` };
        }
        return { valid: true };
    }
    async getStageHistory(tenantId, candidateId) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: candidateId, tenantId },
        });
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        const history = await this.prisma.candidateStageHistory.findMany({
            where: { tenantId, candidateId },
            orderBy: { createdAt: 'desc' },
        });
        const actorIds = [...new Set(history.filter(h => h.actorId).map(h => h.actorId))];
        const actors = actorIds.length > 0 ? await this.prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, name: true, email: true },
        }) : [];
        const actorMap = new Map(actors.map(a => [a.id, a]));
        return history.map(h => ({
            ...h,
            actor: h.actorId ? actorMap.get(h.actorId) || { id: h.actorId, name: 'Unknown', email: '' } : null,
        }));
    }
};
exports.StageTransitionService = StageTransitionService;
exports.StageTransitionService = StageTransitionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], StageTransitionService);
//# sourceMappingURL=stage-transition.service.js.map