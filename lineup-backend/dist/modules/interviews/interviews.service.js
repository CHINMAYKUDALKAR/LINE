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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const bulk_schedule_dto_1 = require("./dto/bulk-schedule.dto");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const availability_util_1 = require("./utils/availability.util");
const interview_automation_service_1 = require("./services/interview-automation.service");
const recycle_bin_service_1 = require("../recycle-bin/recycle-bin.service");
let InterviewsService = class InterviewsService {
    prisma;
    reminderQueue;
    syncQueue;
    automationService;
    recycleBinService;
    constructor(prisma, reminderQueue, syncQueue, automationService, recycleBinService) {
        this.prisma = prisma;
        this.reminderQueue = reminderQueue;
        this.syncQueue = syncQueue;
        this.automationService = automationService;
        this.recycleBinService = recycleBinService;
    }
    async create(tenantId, userId, dto) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id: dto.candidateId } });
        if (!candidate || candidate.tenantId !== tenantId)
            throw new common_1.NotFoundException('Candidate not found');
        const interviewers = await this.prisma.user.findMany({
            where: { id: { in: dto.interviewerIds }, tenantId }
        });
        if (interviewers.length !== dto.interviewerIds.length) {
            throw new common_1.BadRequestException('One or more interviewers not found in tenant');
        }
        const start = availability_util_1.AvailabilityUtil.parseDate(dto.startAt);
        const end = new Date(start.getTime() + dto.durationMins * 60000);
        await this.checkConflicts(tenantId, dto.interviewerIds, start, end);
        const interview = await this.prisma.interview.create({
            data: {
                tenantId,
                candidateId: dto.candidateId,
                interviewerIds: dto.interviewerIds,
                date: start,
                durationMins: dto.durationMins,
                stage: dto.stage || 'Scheduled',
                status: 'SCHEDULED',
                meetingLink: dto.meetingLink,
                notes: dto.notes
            }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_CREATE', metadata: { id: interview.id } }
        });
        await this.enqueueReminders(tenantId, interview.id, start);
        await this.syncQueue.add('sync', { interviewId: interview.id, tenantId });
        const eventPayload = {
            tenantId,
            interviewId: interview.id,
            candidateId: interview.candidateId,
            interviewerIds: interview.interviewerIds,
            interviewDate: start,
            interviewTime: start.toLocaleTimeString(),
            duration: interview.durationMins,
            stage: interview.stage,
            meetingLink: interview.meetingLink || undefined,
        };
        await this.automationService.onInterviewCreated(eventPayload);
        return interview;
    }
    async reschedule(tenantId, userId, id, dto) {
        const interview = await this.get(tenantId, id);
        const start = availability_util_1.AvailabilityUtil.parseDate(dto.newStartAt);
        const end = new Date(start.getTime() + dto.newDurationMins * 60000);
        await this.checkConflicts(tenantId, interview.interviewerIds, start, end, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: {
                date: start,
                durationMins: dto.newDurationMins,
                status: 'RESCHEDULED'
            }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_RESCHEDULE', metadata: { id, oldDate: interview.date, newDate: start } }
        });
        await this.enqueueReminders(tenantId, id, start);
        await this.syncQueue.add('sync', { interviewId: id, tenantId });
        const eventPayload = {
            tenantId,
            interviewId: id,
            candidateId: updated.candidateId,
            interviewerIds: updated.interviewerIds,
            interviewDate: start,
            interviewTime: start.toLocaleTimeString(),
            duration: updated.durationMins,
            stage: updated.stage,
            meetingLink: updated.meetingLink || undefined,
        };
        await this.automationService.onInterviewRescheduled(eventPayload);
        return updated;
    }
    async get(tenantId, id) {
        const interview = await this.prisma.interview.findUnique({ where: { id } });
        if (!interview || interview.tenantId !== tenantId)
            throw new common_1.NotFoundException('Interview not found');
        return interview;
    }
    async list(tenantId, dto) {
        const page = Number(dto.page) || 1;
        const perPage = Number(dto.perPage) || 20;
        const where = {
            tenantId,
            deletedAt: null,
            candidate: {
                deletedAt: null
            }
        };
        if (dto.interviewerId)
            where.interviewerIds = { has: dto.interviewerId };
        if (dto.candidateId)
            where.candidateId = dto.candidateId;
        if (dto.status)
            where.status = dto.status;
        if (dto.from || dto.to) {
            where.date = {};
            if (dto.from)
                where.date.gte = new Date(dto.from);
            if (dto.to)
                where.date.lte = new Date(dto.to);
        }
        const [total, data] = await Promise.all([
            this.prisma.interview.count({ where }),
            this.prisma.interview.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: dto.sort ? this.parseSort(dto.sort) : { date: 'asc' },
                include: { candidate: { select: { name: true, email: true } } }
            })
        ]);
        return { data, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
    }
    async checkConflicts(tenantId, interviewerIds, start, end, excludeId) {
        const potentialConflicts = await this.prisma.interview.findMany({
            where: {
                tenantId,
                interviewerIds: { hasSome: interviewerIds },
                status: { not: 'CANCELLED' },
                id: excludeId ? { not: excludeId } : undefined,
                date: { lt: end }
            }
        });
        const conflicts = potentialConflicts.filter(i => {
            const iEnd = new Date(i.date.getTime() + i.durationMins * 60000);
            return i.date < end && iEnd > start;
        });
        if (conflicts.length > 0) {
            throw new common_1.ConflictException({
                message: 'Interview conflict detected',
                conflicts: conflicts.map(c => ({ id: c.id, date: c.date, duration: c.durationMins }))
            });
        }
    }
    async cancel(tenantId, userId, id) {
        const interview = await this.get(tenantId, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_CANCEL', metadata: { id } }
        });
        const eventPayload = {
            tenantId,
            interviewId: id,
            candidateId: interview.candidateId,
            interviewerIds: interview.interviewerIds,
            interviewDate: interview.date,
            interviewTime: interview.date.toLocaleTimeString(),
            duration: interview.durationMins,
            stage: interview.stage,
        };
        await this.automationService.onInterviewCancelled(eventPayload);
        return updated;
    }
    async complete(tenantId, userId, id) {
        const interview = await this.get(tenantId, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_COMPLETE', metadata: { id } }
        });
        const eventPayload = {
            tenantId,
            interviewId: id,
            candidateId: interview.candidateId,
            interviewerIds: interview.interviewerIds,
            interviewDate: interview.date,
            interviewTime: interview.date.toLocaleTimeString(),
            duration: interview.durationMins,
            stage: interview.stage,
        };
        await this.automationService.onInterviewCompleted(eventPayload);
        return updated;
    }
    async delete(tenantId, userId, id) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
            include: { candidate: true }
        });
        if (!interview || interview.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Interview not found');
        }
        await this.recycleBinService.softDelete(tenantId, userId, 'interview', id, interview);
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_DELETE', metadata: { id } }
        });
        return { success: true };
    }
    async bulkSchedule(tenantId, userId, dto) {
        const results = {
            total: dto.candidateIds.length,
            scheduled: 0,
            failed: 0,
            interviews: [],
        };
        const candidates = await this.prisma.candidate.findMany({
            where: { id: { in: dto.candidateIds }, tenantId },
        });
        const validCandidateIds = new Set(candidates.map(c => c.id));
        const interviewers = await this.prisma.user.findMany({
            where: { id: { in: dto.interviewerIds }, tenantId },
        });
        if (interviewers.length !== dto.interviewerIds.length) {
            throw new common_1.BadRequestException('One or more interviewers not found');
        }
        let slots = [];
        switch (dto.strategy) {
            case bulk_schedule_dto_1.BulkScheduleStrategy.SAME_TIME:
                if (!dto.scheduledTime) {
                    throw new common_1.BadRequestException('scheduledTime is required for SAME_TIME strategy');
                }
                const sameTime = new Date(dto.scheduledTime);
                slots = dto.candidateIds.map(candidateId => ({
                    candidateId,
                    scheduledAt: sameTime,
                }));
                break;
            case bulk_schedule_dto_1.BulkScheduleStrategy.AUTO:
                const rangeStart = dto.rangeStart ? new Date(dto.rangeStart) : new Date();
                const rangeEnd = dto.rangeEnd ? new Date(dto.rangeEnd) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const interval = (rangeEnd.getTime() - rangeStart.getTime()) / dto.candidateIds.length;
                slots = dto.candidateIds.map((candidateId, index) => ({
                    candidateId,
                    scheduledAt: new Date(rangeStart.getTime() + interval * index),
                }));
                break;
            case bulk_schedule_dto_1.BulkScheduleStrategy.PER_CANDIDATE:
                const baseTime = dto.scheduledTime ? new Date(dto.scheduledTime) : new Date();
                slots = dto.candidateIds.map((candidateId, index) => ({
                    candidateId,
                    scheduledAt: new Date(baseTime.getTime() + index * (dto.durationMins + 15) * 60 * 1000),
                }));
                break;
        }
        for (const slot of slots) {
            if (!validCandidateIds.has(slot.candidateId)) {
                results.interviews.push({ candidateId: slot.candidateId, error: 'Candidate not found' });
                results.failed++;
                continue;
            }
            try {
                const interview = await this.prisma.interview.create({
                    data: {
                        tenantId,
                        candidateId: slot.candidateId,
                        interviewerIds: dto.interviewerIds,
                        date: slot.scheduledAt,
                        durationMins: dto.durationMins,
                        stage: dto.stage || 'Scheduled',
                        status: 'SCHEDULED',
                    },
                });
                for (const interviewerId of dto.interviewerIds) {
                    await this.prisma.busyBlock.create({
                        data: {
                            tenantId,
                            userId: interviewerId,
                            startAt: slot.scheduledAt,
                            endAt: new Date(slot.scheduledAt.getTime() + dto.durationMins * 60000),
                            source: 'interview',
                            sourceId: interview.id,
                            reason: 'Bulk scheduled interview',
                        },
                    });
                }
                await this.enqueueReminders(tenantId, interview.id, slot.scheduledAt);
                const eventPayload = {
                    tenantId,
                    interviewId: interview.id,
                    candidateId: slot.candidateId,
                    interviewerIds: dto.interviewerIds,
                    interviewDate: slot.scheduledAt,
                    interviewTime: slot.scheduledAt.toLocaleTimeString(),
                    duration: dto.durationMins,
                    stage: dto.stage || 'Scheduled',
                };
                await this.automationService.onInterviewCreated(eventPayload);
                results.interviews.push({
                    candidateId: slot.candidateId,
                    interviewId: interview.id,
                    scheduledAt: slot.scheduledAt.toISOString(),
                });
                results.scheduled++;
            }
            catch (error) {
                results.interviews.push({ candidateId: slot.candidateId, error: error.message || 'Failed to schedule' });
                results.failed++;
            }
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'BULK_SCHEDULE',
                metadata: { strategy: dto.strategy, total: results.total, scheduled: results.scheduled, failed: results.failed },
            },
        });
        return results;
    }
    async enqueueReminders(tenantId, interviewId, start) {
        const remind24h = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        if (remind24h > new Date()) {
            await this.reminderQueue.add('reminder', { interviewId, tenantId, type: '24h' }, { delay: remind24h.getTime() - Date.now() });
        }
        const remind1h = new Date(start.getTime() - 60 * 60 * 1000);
        if (remind1h > new Date()) {
            await this.reminderQueue.add('reminder', { interviewId, tenantId, type: '1h' }, { delay: remind1h.getTime() - Date.now() });
        }
    }
    parseSort(sort) {
        const [field, dir] = sort.split(':');
        return { [field]: dir };
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('interview-reminder')),
    __param(2, (0, bullmq_1.InjectQueue)('calendar-sync')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        interview_automation_service_1.InterviewAutomationService,
        recycle_bin_service_1.RecycleBinService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map