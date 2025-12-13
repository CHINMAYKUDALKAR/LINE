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

@Injectable()
export class InterviewsService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('interview-reminder') private reminderQueue: Queue,
        @InjectQueue('calendar-sync') private syncQueue: Queue,
        private automationService: InterviewAutomationService,
        private recycleBinService: RecycleBinService
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
        };
        await this.automationService.onInterviewCreated(eventPayload);

        return interview;
    }

    async reschedule(tenantId: string, userId: string, id: string, dto: RescheduleInterviewDto) {
        const interview = await this.get(tenantId, id);

        const start = AvailabilityUtil.parseDate(dto.newStartAt);
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

        return updated;
    }

    async get(tenantId: string, id: string) {
        const interview = await this.prisma.interview.findUnique({ where: { id } });
        if (!interview || interview.tenantId !== tenantId) throw new NotFoundException('Interview not found');
        return interview;
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

        return { data, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
    }

    async checkConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string) {
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
                    stage: dto.stage || 'Scheduled',
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

    private parseSort(sort: string) {
        const [field, dir] = sort.split(':');
        return { [field]: dir };
    }
}