import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Prisma } from '@prisma/client';
import { AvailabilityService } from './availability.service';
import { BusyBlockService } from './busy-block.service';
import { SchedulingRulesService } from './scheduling-rules.service';
import { InterviewAutomationService } from '../../interviews/services/interview-automation.service';
import {
    CreateSlotDto,
    GenerateSlotsDto,
    BookSlotDto,
    RescheduleSlotDto,
    SlotQueryDto,
    SlotParticipantDto,
} from '../dto';

@Injectable()
export class SlotService {
    private readonly logger = new Logger(SlotService.name);

    constructor(
        private prisma: PrismaService,
        private availabilityService: AvailabilityService,
        private busyBlockService: BusyBlockService,
        private schedulingRulesService: SchedulingRulesService,
        private interviewAutomationService: InterviewAutomationService,
    ) { }

    /**
     * Get slots with filters
     */
    async getSlots(tenantId: string, query: SlotQueryDto) {
        const page = query.page || 1;
        const perPage = query.perPage || 20;
        const skip = (page - 1) * perPage;

        const where: any = { tenantId };

        if (query.status) {
            where.status = query.status;
        }

        if (query.userId) {
            // Filter by participant user ID
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

    /**
     * Get a single slot by ID
     */
    async getSlot(tenantId: string, slotId: string) {
        const slot = await this.prisma.interviewSlot.findFirst({
            where: { id: slotId, tenantId },
        });

        if (!slot) {
            throw new NotFoundException('Slot not found');
        }

        return slot;
    }

    /**
     * Create a single slot directly
     */
    async createSlot(tenantId: string, organizerId: string, dto: CreateSlotDto) {
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);

        if (endAt <= startAt) {
            throw new Error('End time must be after start time');
        }

        // Extract user IDs from participants
        const userIds = dto.participants
            .filter((p) => p.type === 'user')
            .map((p) => p.id);

        // Check availability for user participants
        if (userIds.length > 0) {
            const isAvailable = await this.availabilityService.isSlotAvailable(
                tenantId,
                userIds,
                startAt,
                endAt,
            );

            if (!isAvailable) {
                throw new ConflictException(
                    'One or more participants are not available at this time',
                );
            }
        }

        return this.prisma.interviewSlot.create({
            data: {
                tenantId,
                organizerId,
                participants: dto.participants as any,
                startAt,
                endAt,
                timezone: dto.timezone,
                status: 'AVAILABLE',
                metadata: dto.metadata,
            },
        });
    }

    /**
     * Generate multiple available slots based on availability
     */
    async generateSlots(tenantId: string, organizerId: string, dto: GenerateSlotsDto) {
        const startRange = new Date(dto.startRange);
        const endRange = new Date(dto.endRange);

        // Get available time slots for all users
        const availability = await this.availabilityService.getMultiUserAvailability(
            tenantId,
            dto.userIds,
            startRange,
            endRange,
            dto.slotDurationMins,
            dto.ruleId,
        );

        // Create slots for each available time
        const slots = await Promise.all(
            availability.combined.map((timeSlot) =>
                this.prisma.interviewSlot.create({
                    data: {
                        tenantId,
                        organizerId,
                        participants: dto.userIds.map((id) => ({ type: 'user', id })) as any,
                        startAt: timeSlot.start,
                        endAt: timeSlot.end,
                        timezone: dto.timezone,
                        status: 'AVAILABLE',
                    },
                }),
            ),
        );

        return slots;
    }

    /**
     * Book an available slot
     */
    async bookSlot(
        tenantId: string,
        slotId: string,
        bookedBy: string,
        dto: BookSlotDto,
    ) {
        // Use transaction to prevent race conditions
        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Get and lock the slot
            const slot = await tx.interviewSlot.findFirst({
                where: { id: slotId, tenantId },
            });

            if (!slot) {
                throw new NotFoundException('Slot not found');
            }

            if (slot.status !== 'AVAILABLE') {
                throw new ConflictException('Slot is no longer available');
            }

            // Update participants to include candidate
            const participants = slot.participants as unknown as SlotParticipantDto[];
            participants.push({
                type: 'candidate',
                id: dto.candidateId || dto.candidate.id,
                email: dto.candidate.email,
                phone: dto.candidate.phone,
                name: dto.candidate.name,
            });

            // Create or link interview
            let interviewId = dto.interviewId;

            if (!interviewId) {
                // Get user participant IDs
                const interviewerIds = participants
                    .filter((p) => p.type === 'user')
                    .map((p) => p.id);

                // Create interview record
                const interview = await tx.interview.create({
                    data: {
                        tenantId,
                        candidateId: dto.candidateId || dto.candidate.id,
                        interviewerIds,
                        date: slot.startAt,
                        durationMins: Math.round(
                            (slot.endAt.getTime() - slot.startAt.getTime()) / 60000,
                        ),
                        stage: 'SCHEDULED',
                        status: 'SCHEDULED',
                    },
                });
                interviewId = interview.id;
            }

            // Update slot status
            const updatedSlot = await tx.interviewSlot.update({
                where: { id: slotId },
                data: {
                    status: 'BOOKED',
                    interviewId,
                    participants: participants as any,
                    metadata: {
                        ...(slot.metadata as any),
                        ...dto.metadata,
                        bookedBy,
                        bookedAt: new Date().toISOString(),
                    },
                },
            });

            // Create busy blocks for all user participants
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

            // Trigger automation for interview scheduled
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
            } catch (automationError) {
                this.logger.warn(`Failed to trigger automation for slot ${slotId}:`, automationError);
            }

            return updatedSlot;
        });
    }

    /**
     * Reschedule a booked slot
     */
    async rescheduleSlot(
        tenantId: string,
        slotId: string,
        userId: string,
        dto: RescheduleSlotDto,
    ) {
        const slot = await this.getSlot(tenantId, slotId);

        if (slot.status !== 'BOOKED') {
            throw new ConflictException('Can only reschedule booked slots');
        }

        const newStartAt = new Date(dto.newStartAt);
        const newEndAt = new Date(dto.newEndAt);

        // Check availability for new time
        const participants = slot.participants as unknown as SlotParticipantDto[];
        const userIds = participants.filter((p) => p.type === 'user').map((p) => p.id);

        // Temporarily remove old busy blocks to check availability
        if (slot.interviewId) {
            await this.busyBlockService.deleteBySourceId(tenantId, slot.interviewId);
        }

        const isAvailable = await this.availabilityService.isSlotAvailable(
            tenantId,
            userIds,
            newStartAt,
            newEndAt,
        );

        if (!isAvailable) {
            // Recreate old busy blocks since reschedule failed
            if (slot.interviewId) {
                for (const uId of userIds) {
                    await this.busyBlockService.createFromInterview(
                        tenantId,
                        uId,
                        slot.interviewId,
                        slot.startAt,
                        slot.endAt,
                    );
                }
            }
            throw new ConflictException('New time slot is not available');
        }

        // Update slot
        const updatedSlot = await this.prisma.interviewSlot.update({
            where: { id: slotId },
            data: {
                startAt: newStartAt,
                endAt: newEndAt,
                metadata: {
                    ...(slot.metadata as any),
                    rescheduledAt: new Date().toISOString(),
                    rescheduledBy: userId,
                    rescheduleReason: dto.reason,
                },
            },
        });

        // Update interview if linked
        if (slot.interviewId) {
            await this.prisma.interview.update({
                where: { id: slot.interviewId },
                data: {
                    date: newStartAt,
                    durationMins: Math.round(
                        (newEndAt.getTime() - newStartAt.getTime()) / 60000,
                    ),
                },
            });

            // Create new busy blocks
            for (const uId of userIds) {
                await this.busyBlockService.createFromInterview(
                    tenantId,
                    uId,
                    slot.interviewId,
                    newStartAt,
                    newEndAt,
                );
            }
        }

        // Trigger automation for interview rescheduled
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
            } catch (automationError) {
                this.logger.warn(`Failed to trigger reschedule automation for slot ${slotId}:`, automationError);
            }
        }

        return updatedSlot;
    }

    /**
     * Cancel a slot
     */
    async cancelSlot(tenantId: string, slotId: string, userId: string) {
        const slot = await this.getSlot(tenantId, slotId);

        if (slot.status === 'CANCELLED') {
            throw new ConflictException('Slot is already cancelled');
        }

        // Update slot status
        const updatedSlot = await this.prisma.interviewSlot.update({
            where: { id: slotId },
            data: {
                status: 'CANCELLED',
                metadata: {
                    ...(slot.metadata as any),
                    cancelledAt: new Date().toISOString(),
                    cancelledBy: userId,
                },
            },
        });

        // Delete busy blocks if interview was booked
        if (slot.interviewId) {
            await this.busyBlockService.deleteBySourceId(tenantId, slot.interviewId);

            // Update interview status
            await this.prisma.interview.update({
                where: { id: slot.interviewId },
                data: { status: 'CANCELLED' },
            });
        }

        // Trigger automation for interview cancelled
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
            } catch (automationError) {
                this.logger.warn(`Failed to trigger cancel automation for slot ${slotId}:`, automationError);
            }
        }

        return updatedSlot;
    }
}
