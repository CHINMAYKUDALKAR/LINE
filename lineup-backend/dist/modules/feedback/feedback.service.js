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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const feedback_permission_util_1 = require("./validators/feedback-permission.util");
const event_emitter_1 = require("@nestjs/event-emitter");
let FeedbackService = class FeedbackService {
    prisma;
    eventEmitter;
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
    }
    async submitFeedback(tenantId, userId, dto) {
        const interview = await this.prisma.interview.findFirst({
            where: { id: dto.interviewId, tenantId },
            include: { candidate: true }
        });
        if (!interview)
            throw new common_1.NotFoundException('Interview not found');
        if (dto.rating < 1 || dto.rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        (0, feedback_permission_util_1.ensureInterviewerCanSubmit)(interview, userId);
        const feedback = await this.prisma.feedback.upsert({
            where: {
                interviewerId_interviewId: { interviewerId: userId, interviewId: dto.interviewId }
            },
            create: {
                tenantId,
                interviewerId: userId,
                interviewId: dto.interviewId,
                rating: dto.rating,
                criteria: dto.criteria || {},
                comments: dto.comments
            },
            update: {
                rating: dto.rating,
                criteria: dto.criteria || {},
                comments: dto.comments
            }
        });
        const interviewStats = await this.prisma.feedback.aggregate({
            where: { interviewId: dto.interviewId },
            _avg: { rating: true }
        });
        await this.prisma.interview.update({
            where: { id: dto.interviewId },
            data: {
                avgRating: interviewStats._avg.rating,
                hasFeedback: true
            }
        });
        const candidateStats = await this.prisma.feedback.aggregate({
            where: { interview: { candidateId: interview.candidateId } },
            _avg: { rating: true }
        });
        await this.prisma.candidate.update({
            where: { id: interview.candidateId },
            data: {
                overallScore: candidateStats._avg.rating,
                lastFeedbackAt: new Date()
            }
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'FEEDBACK_SUBMIT',
                metadata: { interviewId: dto.interviewId, rating: dto.rating }
            }
        });
        this.eventEmitter.emit('feedback.created', {
            tenantId,
            feedbackId: feedback.id,
            candidateId: interview.candidateId,
            overallScore: dto.rating
        });
        return feedback;
    }
    async getInterviewFeedback(tenantId, interviewId, limit = 50) {
        const feedback = await this.prisma.feedback.findMany({
            where: { tenantId, interviewId },
            take: Math.min(limit, 100),
            orderBy: { createdAt: 'desc' },
        });
        return feedback || [];
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map