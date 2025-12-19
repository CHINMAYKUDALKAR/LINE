import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { ListInterviewsDto } from './dto/list-interviews.dto';
import { BulkScheduleDto, BulkScheduleStrategy, BulkScheduleResult } from './dto/bulk-schedule.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AvailabilityUtil } from './utils/availability.util';
import { InterviewAutomationService } from './services/interview-automation.service';
import { InterviewEventPayload } from './events/interview-events';
import { RecycleBinService } from '../recycle-bin/recycle-bin.service';
import { IntegrationEventsService } from '../integrations/services/integration-events.service';

@Injectable()
export class InterviewsService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('interview-reminder') private reminderQueue: Queue,
        @InjectQueue('calendar-sync') private syncQueue: Queue,
        private automationService: InterviewAutomationService,
        private recycleBinService: RecycleBinService,
        private integrationEvents: IntegrationEventsService
    ) { }

    async create(tenantId: string, userId: string, dto: CreateInterviewDto) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id: dto.candidateId } });
        if (!candidate || candidate.tenantId !== tenantId) throw new NotFoundException('Candidate not found');

        const interviewers = await this.prisma.user.findMany({
            where: { id: { in: dto.interviewerIds }, tenantId }
        });
        if (interviewers.length !== dto.interviewerIds.length) {
            throw new BadRequestException('One or more interviewers not found in tenant');
        }

        const start = AvailabilityUtil.parseDate(dto.startAt);
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

        const eventPayload: InterviewEventPayload = {
            tenantId,
            interviewId: interview.id,
            candidateId: interview.candidateId,
            interviewerIds: interview.interviewerIds,
            interviewDate: start,
            interviewTime: start.toLocaleTimeString(),
            duration: interview.durationMins,
            stage: interview.stage,
            meetingLink: interview.meetingLink || undefined,
            // Pass custom email overrides if provided
            candidateEmailSubject: dto.candidateEmailSubject,
            candidateEmailBody: dto.candidateEmailBody,
            interviewerEmailSubject: dto.interviewerEmailSubject,
            interviewerEmailBody: dto.interviewerEmailBody,
        };
        await this.automationService.onInterviewCreated(eventPayload);

        // Trigger integration sync for interview scheduled (async, non-blocking)
        this.integrationEvents.onInterviewScheduled(tenantId, interview.id, userId).catch(() => { });

        return interview;
    }

    async reschedule(tenantId: string, userId: string, id: string, dto: RescheduleInterviewDto) {
        const interview = await this.get(tenantId, id);

        // Only SCHEDULED or RESCHEDULED interviews can be rescheduled
        if (!['SCHEDULED', 'RESCHEDULED'].includes(interview.status)) {
            throw new BadRequestException(
                `Cannot reschedule interview with status '${interview.status}'. Only SCHEDULED interviews can be rescheduled.`
            );
        }

        const oldDate = interview.date;
        const start = AvailabilityUtil.parseDate(dto.newStartAt);
        const end = new Date(start.getTime() + dto.newDurationMins * 60000);

        // Detect conflicts (warn-only, never block)
        const conflicts = await this.detectConflicts(tenantId, interview.interviewerIds, start, end, id);

        const updated = await this.prisma.interview.update({
            where: { id },
            data: {
                date: start,
                durationMins: dto.newDurationMins,
                status: 'SCHEDULED' // Keep as SCHEDULED (not RESCHEDULED) for calendar clarity
            }
        });

        // Audit log with old and new times
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

        // Create timeline event for candidate
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

        const eventPayload: InterviewEventPayload = {
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

        // Trigger integration sync for interview rescheduled (async, non-blocking)
        this.integrationEvents.onInterviewRescheduled(tenantId, id, userId).catch(() => { });

        // Return enhanced response with conflict warnings
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

    async get(tenantId: string, id: string) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
            include: { candidate: { select: { name: true, email: true } } }
        });
        if (!interview || interview.tenantId !== tenantId) throw new NotFoundException('Interview not found');

        // Enrich with interviewer details
        const [enriched] = await this.enrichWithInterviewers(tenantId, [interview]);
        return enriched;
    }

    async list(tenantId: string, dto: ListInterviewsDto) {
        const page = Number(dto.page) || 1;
        const perPage = Number(dto.perPage) || 20;
        const where: any = {
            tenantId,
            deletedAt: null,
            candidate: {
                deletedAt: null
            }
        };

        if (dto.interviewerId) where.interviewerIds = { has: dto.interviewerId };
        if (dto.candidateId) where.candidateId = dto.candidateId;
        if (dto.status) where.status = dto.status;
        if (dto.from || dto.to) {
            where.date = {};
            if (dto.from) where.date.gte = new Date(dto.from);
            if (dto.to) where.date.lte = new Date(dto.to);
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

        // Enrich interviews with interviewer details
        const enrichedData = await this.enrichWithInterviewers(tenantId, data);

        return { data: enrichedData, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
    }

    /**
     * Detect conflicts (warn-only, never blocks)
     * Returns array of conflicting interviews for the given time slot
     */
    async detectConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string) {
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

    /**
     * Check conflicts and throw error (for create operations)
     * @deprecated Use detectConflicts() for warn-only behavior
     */
    async checkConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string) {
        const conflicts = await this.detectConflicts(tenantId, interviewerIds, start, end, excludeId);
        if (conflicts.length > 0) {
            throw new ConflictException({
                message: 'Interview conflict detected',
                conflicts: conflicts.map(c => ({ id: c.id, date: c.date, duration: c.durationMins }))
            });
        }
    }

    async cancel(tenantId: string, userId: string, id: string) {
        const interview = await this.get(tenantId, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_CANCEL', metadata: { id } }
        });

        const eventPayload: InterviewEventPayload = {
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

    async complete(tenantId: string, userId: string, id: string) {
        const interview = await this.get(tenantId, id);
        const updated = await this.prisma.interview.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_COMPLETE', metadata: { id } }
        });

        const eventPayload: InterviewEventPayload = {
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

        // Trigger integration sync for interview completed (async, non-blocking)
        this.integrationEvents.onInterviewCompleted(tenantId, id, userId).catch(() => { });

        return updated;
    }

    async delete(tenantId: string, userId: string, id: string) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
            include: { candidate: true } // Include related data for full snapshot
        });

        if (!interview || interview.tenantId !== tenantId) {
            throw new NotFoundException('Interview not found');
        }

        // Use new field names: module, itemId, itemSnapshot (full object)
        await this.recycleBinService.softDelete(tenantId, userId, 'interview', id, interview);

        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_DELETE', metadata: { id } }
        });

        return { success: true };
    }

    /**
     * Bulk schedule interviews for multiple candidates
     */
    async bulkSchedule(tenantId: string, userId: string, dto: BulkScheduleDto): Promise<BulkScheduleResult> {
        const results: BulkScheduleResult = {
            total: dto.candidateIds.length,
            scheduled: 0,
            failed: 0,
            interviews: [],
        };

        // Validate candidates exist
        const candidates = await this.prisma.candidate.findMany({
            where: { id: { in: dto.candidateIds }, tenantId },
        });
        const validCandidateIds = new Set(candidates.map(c => c.id));

        // Validate interviewers exist
        const interviewers = await this.prisma.user.findMany({
            where: { id: { in: dto.interviewerIds }, tenantId },
        });
        if (interviewers.length !== dto.interviewerIds.length) {
            throw new BadRequestException('One or more interviewers not found');
        }

        // Calculate interview slots based on strategy
        let slots: Array<{ candidateId: string; scheduledAt: Date }> = [];

        switch (dto.strategy) {
            case BulkScheduleStrategy.SAME_TIME:
                if (!dto.scheduledTime) {
                    throw new BadRequestException('scheduledTime is required for SAME_TIME strategy');
                }
                const sameTime = new Date(dto.scheduledTime);
                slots = dto.candidateIds.map(candidateId => ({
                    candidateId,
                    scheduledAt: sameTime,
                }));
                break;

            case BulkScheduleStrategy.AUTO:
                const rangeStart = dto.rangeStart ? new Date(dto.rangeStart) : new Date();
                const rangeEnd = dto.rangeEnd ? new Date(dto.rangeEnd) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                const interval = (rangeEnd.getTime() - rangeStart.getTime()) / dto.candidateIds.length;
                slots = dto.candidateIds.map((candidateId, index) => ({
                    candidateId,
                    scheduledAt: new Date(rangeStart.getTime() + interval * index),
                }));
                break;

            case BulkScheduleStrategy.PER_CANDIDATE:
                const baseTime = dto.scheduledTime ? new Date(dto.scheduledTime) : new Date();
                slots = dto.candidateIds.map((candidateId, index) => ({
                    candidateId,
                    scheduledAt: new Date(baseTime.getTime() + index * (dto.durationMins + 15) * 60 * 1000),
                }));
                break;
        }

        // Create interviews for each slot
        for (const slot of slots) {
            if (!validCandidateIds.has(slot.candidateId)) {
                results.interviews.push({ candidateId: slot.candidateId, error: 'Candidate not found' });
                results.failed++;
                continue;
            }

            try {
                // Get current candidate stage for audit trail
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

                // Auto-transition candidate stage
                await this.prisma.candidate.update({
                    where: { id: slot.candidateId },
                    data: { stage: newStage },
                });

                // Record in stage history for full audit trail
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

                // Create busy blocks for each interviewer
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

                const eventPayload: InterviewEventPayload = {
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
            } catch (error: any) {
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

    private async enqueueReminders(tenantId: string, interviewId: string, start: Date) {
        const remind24h = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        if (remind24h > new Date()) {
            await this.reminderQueue.add('reminder', { interviewId, tenantId, type: '24h' }, { delay: remind24h.getTime() - Date.now() });
        }

        const remind1h = new Date(start.getTime() - 60 * 60 * 1000);
        if (remind1h > new Date()) {
            await this.reminderQueue.add('reminder', { interviewId, tenantId, type: '1h' }, { delay: remind1h.getTime() - Date.now() });
        }
    }

    // =====================================================
    // INTERVIEW NOTES
    // =====================================================

    /**
     * Sanitize HTML to prevent XSS
     */
    private sanitizeContent(content: string): string {
        return content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * List all notes for an interview with author details (paginated)
     */
    async listNotes(tenantId: string, interviewId: string, page = 1, perPage = 20) {
        await this.get(tenantId, interviewId); // Validate interview exists

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

        // Batch fetch authors to avoid N+1
        const authorIds = [...new Set(notes.map((n: { authorId: string }) => n.authorId))];
        const authors = authorIds.length > 0 ? await this.prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, email: true },
        }) : [];
        const authorMap = new Map(authors.map(a => [a.id, a]));

        const enrichedNotes = notes.map((note: { authorId: string }) => ({
            ...note,
            author: authorMap.get(note.authorId) || { id: note.authorId, name: 'Unknown', email: '' },
        }));

        return {
            data: enrichedNotes,
            meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
        };
    }

    /**
     * Add a note to an interview
     */
    async addNote(tenantId: string, interviewId: string, userId: string, content: string) {
        await this.get(tenantId, interviewId); // Validate interview exists

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

        // Fetch author details
        const author = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        return { ...note, author: author || { id: userId, name: 'Unknown', email: '' } };
    }

    /**
     * Update an interview note (author or ADMIN can update)
     */
    async updateNote(tenantId: string, noteId: string, userId: string, userRole: string, content: string) {
        const note = await this.prisma.interviewNote.findUnique({ where: { id: noteId } });

        if (!note || note.tenantId !== tenantId) {
            throw new NotFoundException('Note not found');
        }

        // Allow author or ADMIN to update
        if (note.authorId !== userId && userRole !== 'ADMIN') {
            throw new BadRequestException('Only the author or an admin can update this note');
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

    /**
     * Delete an interview note (author or ADMIN can delete)
     */
    async deleteNote(tenantId: string, noteId: string, userId: string, userRole: string) {
        const note = await this.prisma.interviewNote.findUnique({ where: { id: noteId } });

        if (!note || note.tenantId !== tenantId) {
            throw new NotFoundException('Note not found');
        }

        // Allow author or ADMIN to delete
        if (note.authorId !== userId && userRole !== 'ADMIN') {
            throw new BadRequestException('Only the author or an admin can delete this note');
        }

        await this.prisma.interviewNote.delete({ where: { id: noteId } });

        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'INTERVIEW_NOTE_DELETE', metadata: { noteId, interviewId: note.interviewId } },
        });

        return { success: true };
    }

    /**
     * Get interview timeline (notes, feedback, audit logs)
     */
    async getTimeline(tenantId: string, interviewId: string) {
        await this.get(tenantId, interviewId); // Validate interview exists

        // Fetch notes, feedback, and audit logs in parallel
        const [notes, feedbacks, auditLogs] = await Promise.all([
            this.prisma.interviewNote.findMany({
                where: { tenantId, interviewId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.feedback.findMany({
                where: { tenantId, interviewId },
                orderBy: { createdAt: 'desc' },
            }),
            // Query audit logs matching multiple possible metadata shapes
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

        // Collect all user IDs for batch fetch
        const userIds = new Set<string>();
        notes.forEach((n: { authorId: string }) => userIds.add(n.authorId));
        feedbacks.forEach(f => userIds.add(f.interviewerId));
        auditLogs.forEach(a => { if (a.userId) userIds.add(a.userId); });

        const users = userIds.size > 0 ? await this.prisma.user.findMany({
            where: { id: { in: [...userIds] } },
            select: { id: true, name: true, email: true },
        }) : [];
        const userMap = new Map(users.map(u => [u.id, u]));

        // Build timeline items
        type TimelineItem = {
            type: 'note' | 'feedback' | 'activity';
            id: string;
            createdAt: Date;
            author?: { id: string; name: string | null; email: string };
            content?: string;
            rating?: number;
            action?: string;
        };

        const timeline: TimelineItem[] = [];

        notes.forEach((note: { id: string; authorId: string; createdAt: Date; content: string }) => {
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

        // Sort by createdAt descending
        timeline.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return { data: timeline };
    }

    private parseSort(sort: string) {
        const [field, dir] = sort.split(':');
        return { [field]: dir };
    }

    /**
     * Enrich interviews with interviewer details by batch-fetching users.
     * Also flattens candidate data to candidateName/candidateEmail for frontend compatibility.
     * Prevents N+1 queries by collecting all unique interviewerIds and fetching in one query.
     */
    private async enrichWithInterviewers<T extends { interviewerIds: string[]; candidate?: { name: string | null; email: string | null } | null }>(
        tenantId: string,
        interviews: T[]
    ): Promise<(T & {
        interviewers: Array<{ id: string; name: string | null; email: string; role: string }>;
        candidateName: string;
        candidateEmail: string;
    })[]> {
        if (interviews.length === 0) {
            return [];
        }

        // Collect all unique interviewer IDs across all interviews
        const allInterviewerIds = new Set<string>();
        for (const interview of interviews) {
            for (const id of interview.interviewerIds) {
                allInterviewerIds.add(id);
            }
        }

        // Batch-fetch all users in one query with tenant isolation
        let userMap = new Map<string, { id: string; name: string | null; email: string; role: string }>();
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

        // Map users back to each interview and flatten candidate data
        return interviews.map(interview => ({
            ...interview,
            candidateName: interview.candidate?.name || 'Unknown',
            candidateEmail: interview.candidate?.email || '',
            interviewers: interview.interviewerIds
                .map(id => userMap.get(id))
                .filter((u): u is NonNullable<typeof u> => u !== undefined),
        }));
    }
}