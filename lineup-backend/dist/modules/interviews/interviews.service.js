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
var InterviewsService_1;
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
const integration_events_service_1 = require("../integrations/services/integration-events.service");
let InterviewsService = class InterviewsService {
    static { InterviewsService_1 = this; }
    prisma;
    reminderQueue;
    syncQueue;
    automationService;
    recycleBinService;
    integrationEvents;
    logger = new common_1.Logger(InterviewsService_1.name);
    static ALLOWED_STATUS_TRANSITIONS = {
        SCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
        RESCHEDULED: ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'SCHEDULED'],
        COMPLETED: [],
        CANCELLED: ['SCHEDULED'],
        NO_SHOW: ['SCHEDULED'],
    };
    constructor(prisma, reminderQueue, syncQueue, automationService, recycleBinService, integrationEvents) {
        this.prisma = prisma;
        this.reminderQueue = reminderQueue;
        this.syncQueue = syncQueue;
        this.automationService = automationService;
        this.recycleBinService = recycleBinService;
        this.integrationEvents = integrationEvents;
    }
    validateStatusTransition(currentStatus, newStatus) {
        const allowed = InterviewsService_1.ALLOWED_STATUS_TRANSITIONS[currentStatus];
        if (!allowed) {
            throw new common_1.BadRequestException(`Unknown interview status: ${currentStatus}`);
        }
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}. ` +
                `Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none (terminal state)'}`);
        }
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
        const interview = await this.prisma.$transaction(async (tx) => {
            const existingInterview = await tx.interview.findFirst({
                where: {
                    tenantId,
                    candidateId: dto.candidateId,
                    status: 'SCHEDULED',
                    date: { gt: new Date() },
                },
                select: { id: true, date: true },
            });
            if (existingInterview) {
                throw new common_1.ConflictException({
                    message: 'Candidate already has a scheduled interview',
                    candidateId: dto.candidateId,
                    reason: 'INTERVIEW_ALREADY_SCHEDULED',
                    existingInterviewId: existingInterview.id,
                    existingInterviewDate: existingInterview.date,
                });
            }
            const potentialConflicts = await tx.interview.findMany({
                where: {
                    tenantId,
                    interviewerIds: { hasSome: dto.interviewerIds },
                    status: { not: 'CANCELLED' },
                    date: { lt: end }
                }
            });
            const conflicts = potentialConflicts.filter(i => {
                const iEnd = new Date(i.date.getTime() + i.durationMins * 60000);
                return iEnd > start;
            });
            if (conflicts.length > 0) {
                throw new common_1.ConflictException({
                    message: 'Interview conflict detected',
                    conflicts: conflicts.map(c => ({ id: c.id, date: c.date, duration: c.durationMins }))
                });
            }
            const newInterview = await tx.interview.create({
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
            await tx.auditLog.create({
                data: { tenantId, userId, action: 'INTERVIEW_CREATE', metadata: { id: newInterview.id } }
            });
            for (const interviewerId of dto.interviewerIds) {
                await tx.busyBlock.create({
                    data: {
                        tenantId,
                        userId: interviewerId,
                        startAt: start,
                        endAt: end,
                        source: 'interview',
                        sourceId: newInterview.id,
                        reason: 'Interview scheduled',
                    },
                });
            }
            return newInterview;
        }, {
            isolationLevel: 'Serializable',
            timeout: 10000,
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
            candidateEmailSubject: dto.candidateEmailSubject,
            candidateEmailBody: dto.candidateEmailBody,
            interviewerEmailSubject: dto.interviewerEmailSubject,
            interviewerEmailBody: dto.interviewerEmailBody,
        };
        await this.automationService.onInterviewCreated(eventPayload);
        this.integrationEvents.onInterviewScheduled(tenantId, interview.id, userId)
            .catch(e => console.error('Integration sync failed:', e.message));
        return interview;
    }
    async reschedule(tenantId, userId, id, dto) {
        const interview = await this.get(tenantId, id);
        if (!['SCHEDULED', 'RESCHEDULED'].includes(interview.status)) {
            throw new common_1.BadRequestException(`Cannot reschedule interview with status '${interview.status}'. Only SCHEDULED interviews can be rescheduled.`);
        }
        const oldDate = interview.date;
        const start = availability_util_1.AvailabilityUtil.parseDate(dto.newStartAt);
        const end = new Date(start.getTime() + dto.newDurationMins * 60000);
        await this.prisma.busyBlock.deleteMany({
            where: {
                tenantId,
                sourceId: id,
            },
        });
        const conflicts = await this.detectConflicts(tenantId, interview.interviewerIds, start, end, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: {
                date: start,
                durationMins: dto.newDurationMins,
                status: 'SCHEDULED'
            }
        });
        for (const interviewerId of interview.interviewerIds) {
            await this.prisma.busyBlock.create({
                data: {
                    tenantId,
                    userId: interviewerId,
                    startAt: start,
                    endAt: end,
                    source: 'interview',
                    sourceId: id,
                    reason: 'Interview scheduled',
                },
            });
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'INTERVIEW_RESCHEDULE',
                metadata: {
                    id,
                    oldDate,
                    newDate: start,
                    oldDuration: interview.durationMins,
                    newDuration: dto.newDurationMins,
                    hasConflicts: conflicts.length > 0,
                }
            }
        });
        await this.prisma.candidateNote.create({
            data: {
                tenantId,
                candidateId: interview.candidateId,
                authorId: userId,
                content: `Interview rescheduled from ${oldDate.toISOString()} to ${start.toISOString()}`,
            },
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
        this.integrationEvents.onInterviewRescheduled(tenantId, id, userId)
            .catch(e => this.logger.warn(`Integration sync failed for rescheduled interview ${id}: ${e.message}`));
        return {
            interview: updated,
            conflicts: conflicts.map(c => ({
                interviewId: c.id,
                date: c.date,
                duration: c.durationMins,
                stage: c.stage,
            })),
            hasConflicts: conflicts.length > 0,
            message: conflicts.length > 0
                ? `Interview rescheduled with ${conflicts.length} conflict warning(s)`
                : 'Interview rescheduled successfully',
        };
    }
    async get(tenantId, id) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
            include: { candidate: { select: { name: true, email: true } } }
        });
        if (!interview || interview.tenantId !== tenantId)
            throw new common_1.NotFoundException('Interview not found');
        const [enriched] = await this.enrichWithInterviewers(tenantId, [interview]);
        return enriched;
    }
    async list(tenantId, dto) {
        const page = Number(dto.page) || 1;
        const perPage = Math.min(Number(dto.perPage) || 20, 100);
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
        const enrichedData = await this.enrichWithInterviewers(tenantId, data);
        return { data: enrichedData, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
    }
    async detectConflicts(tenantId, interviewerIds, start, end, excludeId) {
        const potentialConflicts = await this.prisma.interview.findMany({
            where: {
                tenantId,
                interviewerIds: { hasSome: interviewerIds },
                status: { not: 'CANCELLED' },
                ...(excludeId && { id: { not: excludeId } }),
                date: { lt: end }
            }
        });
        const conflicts = potentialConflicts.filter(i => {
            const iEnd = new Date(i.date.getTime() + i.durationMins * 60000);
            return iEnd > start;
        });
        return conflicts;
    }
    async checkConflicts(tenantId, interviewerIds, start, end, excludeId) {
        const conflicts = await this.detectConflicts(tenantId, interviewerIds, start, end, excludeId);
        if (conflicts.length > 0) {
            throw new common_1.ConflictException({
                message: 'Interview conflict detected',
                conflicts: conflicts.map(c => ({ id: c.id, date: c.date, duration: c.durationMins }))
            });
        }
    }
    async checkCandidateHasActiveInterview(tenantId, candidateId, excludeInterviewId) {
        const existingInterview = await this.prisma.interview.findFirst({
            where: {
                tenantId,
                candidateId,
                status: 'SCHEDULED',
                date: { gt: new Date() },
                ...(excludeInterviewId && { id: { not: excludeInterviewId } }),
            },
            select: { id: true, date: true, durationMins: true, stage: true },
        });
        if (existingInterview) {
            throw new common_1.ConflictException({
                message: 'Candidate already has a scheduled interview',
                candidateId,
                reason: 'INTERVIEW_ALREADY_SCHEDULED',
                existingInterviewId: existingInterview.id,
                existingInterviewDate: existingInterview.date,
            });
        }
    }
    async cancel(tenantId, userId, id) {
        const interview = await this.get(tenantId, id);
        this.validateStatusTransition(interview.status, 'CANCELLED');
        const updated = await this.prisma.interview.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_CANCEL', metadata: { id } }
        });
        await this.prisma.busyBlock.deleteMany({
            where: {
                tenantId,
                sourceId: id,
            },
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
        this.validateStatusTransition(interview.status, 'COMPLETED');
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
        this.integrationEvents.onInterviewCompleted(tenantId, id, userId)
            .catch(e => this.logger.warn(`Integration sync failed for completed interview ${id}: ${e.message}`));
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
        const { v4: uuidv4 } = require('uuid');
        const bulkBatchId = uuidv4();
        const bulkMode = dto.bulkMode || this.mapLegacyStrategyToMode(dto.strategy);
        if (!bulkMode) {
            throw new common_1.BadRequestException('bulkMode is required. Use SEQUENTIAL or GROUP.');
        }
        const startTime = dto.startTime || dto.scheduledTime;
        if (!startTime) {
            throw new common_1.BadRequestException('startTime is required');
        }
        const baseStartTime = new Date(startTime);
        const candidates = await this.prisma.candidate.findMany({
            where: { id: { in: dto.candidateIds }, tenantId, deletedAt: null },
        });
        const validCandidateIds = new Set(candidates.map(c => c.id));
        const interviewers = await this.prisma.user.findMany({
            where: { id: { in: dto.interviewerIds }, tenantId },
        });
        if (interviewers.length !== dto.interviewerIds.length) {
            throw new common_1.BadRequestException('One or more interviewers not found');
        }
        const results = {
            total: dto.candidateIds.length,
            scheduled: 0,
            skipped: 0,
            bulkBatchId,
            bulkMode,
            created: [],
            skippedCandidates: [],
        };
        if (bulkMode === 'GROUP') {
            await this.handleGroupMode(tenantId, userId, dto, candidates, validCandidateIds, baseStartTime, bulkBatchId, results);
        }
        else {
            await this.handleSequentialMode(tenantId, userId, dto, candidates, validCandidateIds, baseStartTime, bulkBatchId, results);
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'BULK_SCHEDULE',
                metadata: {
                    bulkMode,
                    bulkBatchId,
                    total: results.total,
                    scheduled: results.scheduled,
                    skipped: results.skipped,
                },
            },
        });
        return results;
    }
    async handleGroupMode(tenantId, userId, dto, candidates, validCandidateIds, startTime, bulkBatchId, results) {
        const endTime = new Date(startTime.getTime() + dto.durationMins * 60000);
        const stage = dto.stage || 'Interview';
        const conflicts = await this.detectConflicts(tenantId, dto.interviewerIds, startTime, endTime);
        if (conflicts.length > 0) {
            for (const candidateId of dto.candidateIds) {
                results.skippedCandidates.push({
                    candidateId,
                    reason: 'Interviewer unavailable at this time',
                });
                results.skipped++;
            }
            return;
        }
        const validCandidates = dto.candidateIds.filter(id => validCandidateIds.has(id));
        const invalidCandidates = dto.candidateIds.filter(id => !validCandidateIds.has(id));
        for (const candidateId of invalidCandidates) {
            results.skippedCandidates.push({ candidateId, reason: 'Candidate not found' });
            results.skipped++;
        }
        if (validCandidates.length === 0) {
            return;
        }
        const primaryCandidateId = validCandidates[0];
        try {
            const interview = await this.prisma.interview.create({
                data: {
                    tenantId,
                    candidateId: primaryCandidateId,
                    candidateIds: validCandidates,
                    interviewerIds: dto.interviewerIds,
                    date: startTime,
                    durationMins: dto.durationMins,
                    stage,
                    status: 'SCHEDULED',
                    bulkMode: 'GROUP',
                    bulkBatchId,
                },
            });
            await this.prisma.candidate.updateMany({
                where: { id: { in: validCandidates } },
                data: { stage },
            });
            const stageHistoryData = validCandidates.map(candidateId => {
                const candidate = candidates.find(c => c.id === candidateId);
                return {
                    tenantId,
                    candidateId,
                    previousStage: candidate?.stage || 'Unknown',
                    newStage: stage,
                    source: 'SYSTEM',
                    triggeredBy: 'BULK_SCHEDULE_GROUP',
                    actorId: userId,
                    reason: null,
                };
            });
            await this.prisma.candidateStageHistory.createMany({
                data: stageHistoryData,
            });
            for (const candidateId of validCandidates) {
                results.created.push({
                    candidateId,
                    interviewId: interview.id,
                    scheduledAt: startTime.toISOString(),
                });
                results.scheduled++;
            }
            for (const interviewerId of dto.interviewerIds) {
                await this.prisma.busyBlock.create({
                    data: {
                        tenantId,
                        userId: interviewerId,
                        startAt: startTime,
                        endAt: endTime,
                        source: 'interview',
                        sourceId: interview.id,
                        reason: 'Group interview scheduled',
                    },
                });
            }
            await this.enqueueReminders(tenantId, interview.id, startTime);
            const eventPayload = {
                tenantId,
                interviewId: interview.id,
                candidateId: primaryCandidateId,
                interviewerIds: dto.interviewerIds,
                interviewDate: startTime,
                interviewTime: startTime.toLocaleTimeString(),
                duration: dto.durationMins,
                stage,
            };
            await this.automationService.onInterviewCreated(eventPayload);
        }
        catch (error) {
            for (const candidateId of validCandidates) {
                results.skippedCandidates.push({
                    candidateId,
                    reason: error.message || 'Failed to create group interview',
                });
                results.skipped++;
            }
        }
    }
    async handleSequentialMode(tenantId, userId, dto, candidates, validCandidateIds, baseStartTime, bulkBatchId, results) {
        const stage = dto.stage || 'Interview';
        for (let index = 0; index < dto.candidateIds.length; index++) {
            const candidateId = dto.candidateIds[index];
            if (!validCandidateIds.has(candidateId)) {
                results.skippedCandidates.push({ candidateId, reason: 'Candidate not found' });
                results.skipped++;
                continue;
            }
            const slotStart = new Date(baseStartTime.getTime() + index * dto.durationMins * 60000);
            const slotEnd = new Date(slotStart.getTime() + dto.durationMins * 60000);
            try {
                const candidate = candidates.find(c => c.id === candidateId);
                const previousStage = candidate?.stage || 'Unknown';
                const interview = await this.prisma.$transaction(async (tx) => {
                    const potentialConflicts = await tx.interview.findMany({
                        where: {
                            tenantId,
                            interviewerIds: { hasSome: dto.interviewerIds },
                            status: { not: 'CANCELLED' },
                            date: { lt: slotEnd }
                        }
                    });
                    const conflicts = potentialConflicts.filter(i => {
                        const iEnd = new Date(i.date.getTime() + i.durationMins * 60000);
                        return iEnd > slotStart;
                    });
                    if (conflicts.length > 0) {
                        throw new Error(`Interviewer unavailable at ${slotStart.toISOString()}`);
                    }
                    const newInterview = await tx.interview.create({
                        data: {
                            tenantId,
                            candidateId,
                            interviewerIds: dto.interviewerIds,
                            date: slotStart,
                            durationMins: dto.durationMins,
                            stage,
                            status: 'SCHEDULED',
                            bulkMode: 'SEQUENTIAL',
                            bulkBatchId,
                        },
                    });
                    await tx.candidate.update({
                        where: { id: candidateId },
                        data: { stage },
                    });
                    await tx.candidateStageHistory.create({
                        data: {
                            tenantId,
                            candidateId,
                            previousStage,
                            newStage: stage,
                            source: 'SYSTEM',
                            triggeredBy: 'BULK_SCHEDULE_SEQUENTIAL',
                            actorId: userId,
                            reason: null,
                        },
                    });
                    for (const interviewerId of dto.interviewerIds) {
                        await tx.busyBlock.create({
                            data: {
                                tenantId,
                                userId: interviewerId,
                                startAt: slotStart,
                                endAt: slotEnd,
                                source: 'interview',
                                sourceId: newInterview.id,
                                reason: 'Sequential bulk scheduled interview',
                            },
                        });
                    }
                    return newInterview;
                }, {
                    isolationLevel: 'Serializable',
                    timeout: 10000,
                });
                await this.enqueueReminders(tenantId, interview.id, slotStart);
                const eventPayload = {
                    tenantId,
                    interviewId: interview.id,
                    candidateId,
                    interviewerIds: dto.interviewerIds,
                    interviewDate: slotStart,
                    interviewTime: slotStart.toLocaleTimeString(),
                    duration: dto.durationMins,
                    stage,
                };
                await this.automationService.onInterviewCreated(eventPayload);
                results.created.push({
                    candidateId,
                    interviewId: interview.id,
                    scheduledAt: slotStart.toISOString(),
                });
                results.scheduled++;
            }
            catch (error) {
                results.skippedCandidates.push({
                    candidateId,
                    reason: error.message || 'Failed to schedule',
                });
                results.skipped++;
            }
        }
    }
    mapLegacyStrategyToMode(strategy) {
        if (!strategy)
            return null;
        switch (strategy) {
            case bulk_schedule_dto_1.BulkScheduleStrategy.SAME_TIME:
                return bulk_schedule_dto_1.BulkMode.GROUP;
            case bulk_schedule_dto_1.BulkScheduleStrategy.PER_CANDIDATE:
            case bulk_schedule_dto_1.BulkScheduleStrategy.AUTO:
                return bulk_schedule_dto_1.BulkMode.SEQUENTIAL;
            default:
                return null;
        }
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
    sanitizeContent(content) {
        return content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    async listNotes(tenantId, interviewId, page = 1, perPage = 20) {
        await this.get(tenantId, interviewId);
        const skip = (page - 1) * perPage;
        const [notes, total] = await Promise.all([
            this.prisma.interviewNote.findMany({
                where: { tenantId, interviewId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: perPage,
            }),
            this.prisma.interviewNote.count({ where: { tenantId, interviewId } }),
        ]);
        const authorIds = [...new Set(notes.map((n) => n.authorId))];
        const authors = authorIds.length > 0 ? await this.prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, email: true },
        }) : [];
        const authorMap = new Map(authors.map(a => [a.id, a]));
        const enrichedNotes = notes.map((note) => ({
            ...note,
            author: authorMap.get(note.authorId) || { id: note.authorId, name: 'Unknown', email: '' },
        }));
        return {
            data: enrichedNotes,
            meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
        };
    }
    async addNote(tenantId, interviewId, userId, content) {
        await this.get(tenantId, interviewId);
        const sanitizedContent = this.sanitizeContent(content);
        const note = await this.prisma.interviewNote.create({
            data: {
                tenantId,
                interviewId,
                authorId: userId,
                content: sanitizedContent,
            },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_NOTE_ADD', metadata: { interviewId, noteId: note.id } },
        });
        const author = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });
        return { ...note, author: author || { id: userId, name: 'Unknown', email: '' } };
    }
    async updateNote(tenantId, noteId, userId, userRole, content) {
        const note = await this.prisma.interviewNote.findUnique({ where: { id: noteId } });
        if (!note || note.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only the author or an admin can update this note');
        }
        const sanitizedContent = this.sanitizeContent(content);
        const updated = await this.prisma.interviewNote.update({
            where: { id: noteId },
            data: { content: sanitizedContent },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_NOTE_UPDATE', metadata: { noteId } },
        });
        return updated;
    }
    async deleteNote(tenantId, noteId, userId, userRole) {
        const note = await this.prisma.interviewNote.findUnique({ where: { id: noteId } });
        if (!note || note.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only the author or an admin can delete this note');
        }
        await this.prisma.interviewNote.delete({ where: { id: noteId } });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_NOTE_DELETE', metadata: { noteId, interviewId: note.interviewId } },
        });
        return { success: true };
    }
    async getTimeline(tenantId, interviewId) {
        await this.get(tenantId, interviewId);
        const [notes, feedbacks, auditLogs] = await Promise.all([
            this.prisma.interviewNote.findMany({
                where: { tenantId, interviewId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.feedback.findMany({
                where: { tenantId, interviewId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.findMany({
                where: {
                    tenantId,
                    action: { startsWith: 'INTERVIEW_' },
                    OR: [
                        { metadata: { path: ['interviewId'], equals: interviewId } },
                        { metadata: { path: ['id'], equals: interviewId } },
                    ],
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
        ]);
        const userIds = new Set();
        notes.forEach((n) => userIds.add(n.authorId));
        feedbacks.forEach(f => userIds.add(f.interviewerId));
        auditLogs.forEach(a => { if (a.userId)
            userIds.add(a.userId); });
        const users = userIds.size > 0 ? await this.prisma.user.findMany({
            where: { id: { in: [...userIds] } },
            select: { id: true, name: true, email: true },
        }) : [];
        const userMap = new Map(users.map(u => [u.id, u]));
        const timeline = [];
        notes.forEach((note) => {
            timeline.push({
                type: 'note',
                id: note.id,
                createdAt: note.createdAt,
                author: userMap.get(note.authorId) || { id: note.authorId, name: 'Unknown', email: '' },
                content: note.content,
            });
        });
        feedbacks.forEach(fb => {
            timeline.push({
                type: 'feedback',
                id: fb.id,
                createdAt: fb.createdAt,
                author: userMap.get(fb.interviewerId) || { id: fb.interviewerId, name: 'Unknown', email: '' },
                rating: fb.rating,
                content: fb.comments || undefined,
            });
        });
        auditLogs.forEach(log => {
            timeline.push({
                type: 'activity',
                id: log.id,
                createdAt: log.createdAt,
                author: log.userId ? (userMap.get(log.userId) || { id: log.userId, name: 'Unknown', email: '' }) : undefined,
                action: log.action,
            });
        });
        timeline.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return { data: timeline };
    }
    parseSort(sort) {
        const [field, dir] = sort.split(':');
        return { [field]: dir };
    }
    async enrichWithInterviewers(tenantId, interviews) {
        if (interviews.length === 0) {
            return [];
        }
        const allInterviewerIds = new Set();
        for (const interview of interviews) {
            for (const id of interview.interviewerIds) {
                allInterviewerIds.add(id);
            }
        }
        let userMap = new Map();
        if (allInterviewerIds.size > 0) {
            const users = await this.prisma.user.findMany({
                where: {
                    id: { in: Array.from(allInterviewerIds) },
                    tenantId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
            userMap = new Map(users.map(u => [u.id, u]));
        }
        return interviews.map(interview => ({
            ...interview,
            candidateName: interview.candidate?.name || 'Unknown',
            candidateEmail: interview.candidate?.email || '',
            interviewers: interview.interviewerIds
                .map(id => userMap.get(id))
                .filter((u) => u !== undefined),
        }));
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = InterviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)('interview-reminder')),
    __param(2, (0, bullmq_1.InjectQueue)('calendar-sync')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        interview_automation_service_1.InterviewAutomationService,
        recycle_bin_service_1.RecycleBinService,
        integration_events_service_1.IntegrationEventsService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map