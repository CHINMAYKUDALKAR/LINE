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
        if (!['SCHEDULED', 'RESCHEDULED'].includes(interview.status)) {
            throw new common_1.BadRequestException(`Cannot reschedule interview with status '${interview.status}'. Only SCHEDULED interviews can be rescheduled.`);
        }
        const oldDate = interview.date;
        const start = availability_util_1.AvailabilityUtil.parseDate(dto.newStartAt);
        const end = new Date(start.getTime() + dto.newDurationMins * 60000);
        const conflicts = await this.detectConflicts(tenantId, interview.interviewerIds, start, end, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: {
                date: start,
                durationMins: dto.newDurationMins,
                status: 'SCHEDULED'
            }
        });
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
        const enrichedData = await this.enrichWithInterviewers(tenantId, data);
        return { data: enrichedData, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
    }
    async detectConflicts(tenantId, interviewerIds, start, end, excludeId) {
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
                const candidate = candidates.find(c => c.id === slot.candidateId);
                const previousStage = candidate?.stage || 'Unknown';
                const newStage = dto.stage || 'Interview';
                const interview = await this.prisma.interview.create({
                    data: {
                        tenantId,
                        candidateId: slot.candidateId,
                        interviewerIds: dto.interviewerIds,
                        date: slot.scheduledAt,
                        durationMins: dto.durationMins,
                        stage: newStage,
                        status: 'SCHEDULED',
                    },
                });
                await this.prisma.candidate.update({
                    where: { id: slot.candidateId },
                    data: { stage: newStage },
                });
                await this.prisma.candidateStageHistory.create({
                    data: {
                        tenantId,
                        candidateId: slot.candidateId,
                        previousStage,
                        newStage,
                        source: 'SYSTEM',
                        triggeredBy: 'BULK_SCHEDULE',
                        actorId: userId,
                        reason: null,
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
                    stage: newStage,
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