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
var SlotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const availability_service_1 = require("./availability.service");
const busy_block_service_1 = require("./busy-block.service");
const scheduling_rules_service_1 = require("./scheduling-rules.service");
const interview_automation_service_1 = require("../../interviews/services/interview-automation.service");
let SlotService = SlotService_1 = class SlotService {
    prisma;
    availabilityService;
    busyBlockService;
    schedulingRulesService;
    interviewAutomationService;
    logger = new common_1.Logger(SlotService_1.name);
    constructor(prisma, availabilityService, busyBlockService, schedulingRulesService, interviewAutomationService) {
        this.prisma = prisma;
        this.availabilityService = availabilityService;
        this.busyBlockService = busyBlockService;
        this.schedulingRulesService = schedulingRulesService;
        this.interviewAutomationService = interviewAutomationService;
    }
    async getSlots(tenantId, query) {
        const page = query.page || 1;
        const perPage = query.perPage || 20;
        const skip = (page - 1) * perPage;
        const where = { tenantId };
        if (query.status) {
            where.status = query.status;
        }
        if (query.userId) {
            where.participants = {
                path: '$[*].id',
                array_contains: query.userId,
            };
        }
        if (query.start) {
            where.startAt = { gte: new Date(query.start) };
        }
        if (query.end) {
            where.endAt = { ...(where.endAt || {}), lte: new Date(query.end) };
        }
        const [slots, total] = await Promise.all([
            this.prisma.interviewSlot.findMany({
                where,
                orderBy: { startAt: 'asc' },
                skip,
                take: perPage,
            }),
            this.prisma.interviewSlot.count({ where }),
        ]);
        return {
            items: slots,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async getSlot(tenantId, slotId) {
        const slot = await this.prisma.interviewSlot.findFirst({
            where: { id: slotId, tenantId },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Slot not found');
        }
        return slot;
    }
    async createSlot(tenantId, organizerId, dto) {
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);
        if (endAt <= startAt) {
            throw new Error('End time must be after start time');
        }
        const userIds = dto.participants
            .filter((p) => p.type === 'user')
            .map((p) => p.id);
        if (userIds.length > 0) {
            const isAvailable = await this.availabilityService.isSlotAvailable(tenantId, userIds, startAt, endAt);
            if (!isAvailable) {
                throw new common_1.ConflictException('One or more participants are not available at this time');
            }
        }
        return this.prisma.interviewSlot.create({
            data: {
                tenantId,
                organizerId,
                participants: dto.participants,
                startAt,
                endAt,
                timezone: dto.timezone,
                status: 'AVAILABLE',
                metadata: dto.metadata,
            },
        });
    }
    async generateSlots(tenantId, organizerId, dto) {
        const startRange = new Date(dto.startRange);
        const endRange = new Date(dto.endRange);
        const availability = await this.availabilityService.getMultiUserAvailability(tenantId, dto.userIds, startRange, endRange, dto.slotDurationMins, dto.ruleId);
        const slots = await Promise.all(availability.combined.map((timeSlot) => this.prisma.interviewSlot.create({
            data: {
                tenantId,
                organizerId,
                participants: dto.userIds.map((id) => ({ type: 'user', id })),
                startAt: timeSlot.start,
                endAt: timeSlot.end,
                timezone: dto.timezone,
                status: 'AVAILABLE',
            },
        })));
        return slots;
    }
    async bookSlot(tenantId, slotId, bookedBy, dto) {
        return this.prisma.$transaction(async (tx) => {
            const slot = await tx.interviewSlot.findFirst({
                where: { id: slotId, tenantId },
            });
            if (!slot) {
                throw new common_1.NotFoundException('Slot not found');
            }
            if (slot.status !== 'AVAILABLE') {
                throw new common_1.ConflictException('Slot is no longer available');
            }
            const participants = slot.participants;
            participants.push({
                type: 'candidate',
                id: dto.candidateId || dto.candidate.id,
                email: dto.candidate.email,
                phone: dto.candidate.phone,
                name: dto.candidate.name,
            });
            let interviewId = dto.interviewId;
            if (!interviewId) {
                const interviewerIds = participants
                    .filter((p) => p.type === 'user')
                    .map((p) => p.id);
                const interview = await tx.interview.create({
                    data: {
                        tenantId,
                        candidateId: dto.candidateId || dto.candidate.id,
                        interviewerIds,
                        date: slot.startAt,
                        durationMins: Math.round((slot.endAt.getTime() - slot.startAt.getTime()) / 60000),
                        stage: 'SCHEDULED',
                        status: 'SCHEDULED',
                    },
                });
                interviewId = interview.id;
            }
            const updatedSlot = await tx.interviewSlot.update({
                where: { id: slotId },
                data: {
                    status: 'BOOKED',
                    interviewId,
                    participants: participants,
                    metadata: {
                        ...slot.metadata,
                        ...dto.metadata,
                        bookedBy,
                        bookedAt: new Date().toISOString(),
                    },
                },
            });
            const userParticipants = participants.filter((p) => p.type === 'user');
            for (const participant of userParticipants) {
                await tx.busyBlock.create({
                    data: {
                        tenantId,
                        userId: participant.id,
                        startAt: slot.startAt,
                        endAt: slot.endAt,
                        source: 'interview',
                        sourceId: interviewId,
                        reason: 'Interview booked',
                    },
                });
            }
            try {
                const interview = await tx.interview.findUnique({
                    where: { id: interviewId },
                });
                if (interview) {
                    await this.interviewAutomationService.onInterviewCreated({
                        tenantId,
                        interviewId: interview.id,
                        candidateId: interview.candidateId,
                        interviewerIds: interview.interviewerIds,
                        interviewDate: interview.date,
                        interviewTime: interview.date.toLocaleTimeString(),
                        duration: interview.durationMins,
                        stage: interview.stage,
                        meetingLink: interview.meetingLink || undefined,
                    });
                }
            }
            catch (automationError) {
                this.logger.warn(`Failed to trigger automation for slot ${slotId}:`, automationError);
            }
            return updatedSlot;
        });
    }
    async rescheduleSlot(tenantId, slotId, userId, dto) {
        const slot = await this.getSlot(tenantId, slotId);
        if (slot.status !== 'BOOKED') {
            throw new common_1.ConflictException('Can only reschedule booked slots');
        }
        const newStartAt = new Date(dto.newStartAt);
        const newEndAt = new Date(dto.newEndAt);
        const participants = slot.participants;
        const userIds = participants.filter((p) => p.type === 'user').map((p) => p.id);
        if (slot.interviewId) {
            await this.busyBlockService.deleteBySourceId(tenantId, slot.interviewId);
        }
        const isAvailable = await this.availabilityService.isSlotAvailable(tenantId, userIds, newStartAt, newEndAt);
        if (!isAvailable) {
            if (slot.interviewId) {
                for (const uId of userIds) {
                    await this.busyBlockService.createFromInterview(tenantId, uId, slot.interviewId, slot.startAt, slot.endAt);
                }
            }
            throw new common_1.ConflictException('New time slot is not available');
        }
        const updatedSlot = await this.prisma.interviewSlot.update({
            where: { id: slotId },
            data: {
                startAt: newStartAt,
                endAt: newEndAt,
                metadata: {
                    ...slot.metadata,
                    rescheduledAt: new Date().toISOString(),
                    rescheduledBy: userId,
                    rescheduleReason: dto.reason,
                },
            },
        });
        if (slot.interviewId) {
            await this.prisma.interview.update({
                where: { id: slot.interviewId },
                data: {
                    date: newStartAt,
                    durationMins: Math.round((newEndAt.getTime() - newStartAt.getTime()) / 60000),
                },
            });
            for (const uId of userIds) {
                await this.busyBlockService.createFromInterview(tenantId, uId, slot.interviewId, newStartAt, newEndAt);
            }
        }
        if (slot.interviewId) {
            try {
                const interview = await this.prisma.interview.findUnique({
                    where: { id: slot.interviewId },
                });
                if (interview) {
                    await this.interviewAutomationService.onInterviewRescheduled({
                        tenantId,
                        interviewId: interview.id,
                        candidateId: interview.candidateId,
                        interviewerIds: interview.interviewerIds,
                        interviewDate: interview.date,
                        interviewTime: interview.date.toLocaleTimeString(),
                        duration: interview.durationMins,
                        stage: interview.stage,
                        meetingLink: interview.meetingLink || undefined,
                    });
                }
            }
            catch (automationError) {
                this.logger.warn(`Failed to trigger reschedule automation for slot ${slotId}:`, automationError);
            }
        }
        return updatedSlot;
    }
    async cancelSlot(tenantId, slotId, userId) {
        const slot = await this.getSlot(tenantId, slotId);
        if (slot.status === 'CANCELLED') {
            throw new common_1.ConflictException('Slot is already cancelled');
        }
        const updatedSlot = await this.prisma.interviewSlot.update({
            where: { id: slotId },
            data: {
                status: 'CANCELLED',
                metadata: {
                    ...slot.metadata,
                    cancelledAt: new Date().toISOString(),
                    cancelledBy: userId,
                },
            },
        });
        if (slot.interviewId) {
            await this.busyBlockService.deleteBySourceId(tenantId, slot.interviewId);
            await this.prisma.interview.update({
                where: { id: slot.interviewId },
                data: { status: 'CANCELLED' },
            });
        }
        if (slot.interviewId) {
            try {
                const interview = await this.prisma.interview.findUnique({
                    where: { id: slot.interviewId },
                });
                if (interview) {
                    await this.interviewAutomationService.onInterviewCancelled({
                        tenantId,
                        interviewId: interview.id,
                        candidateId: interview.candidateId,
                        interviewerIds: interview.interviewerIds,
                        interviewDate: interview.date,
                        interviewTime: interview.date.toLocaleTimeString(),
                        duration: interview.durationMins,
                        stage: interview.stage,
                        meetingLink: interview.meetingLink || undefined,
                    });
                }
            }
            catch (automationError) {
                this.logger.warn(`Failed to trigger cancel automation for slot ${slotId}:`, automationError);
            }
        }
        return updatedSlot;
    }
};
exports.SlotService = SlotService;
exports.SlotService = SlotService = SlotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        availability_service_1.AvailabilityService,
        busy_block_service_1.BusyBlockService,
        scheduling_rules_service_1.SchedulingRulesService,
        interview_automation_service_1.InterviewAutomationService])
], SlotService);
//# sourceMappingURL=slot.service.js.map