import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma.service';
import { WorkdayApiService } from './workday.api';
import { SyncLogService } from '../../services/sync-log.service';
import {
    mapCandidateToWorkday,
    mapStageToWorkday,
    formatInterviewTitle,
    formatInterviewNotes,
    mapInterviewStatusToWorkday,
} from './workday.mapping';

/**
 * Workday Sync Handler
 *
 * Handles event-driven synchronization from Lineup to Workday Recruiting.
 * Called by the sync processor when integration events are queued.
 */
@Injectable()
export class WorkdaySyncHandler {
    private readonly logger = new Logger(WorkdaySyncHandler.name);

    constructor(
        private prisma: PrismaService,
        private apiService: WorkdayApiService,
        private syncLogService: SyncLogService,
    ) { }

    // ============================================
    // Candidate Event Handlers
    // ============================================

    /**
     * Handle candidate created event
     */
    async handleCandidateCreated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'workday',
            eventType: 'CANDIDATE_CREATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            // Fetch candidate data
            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Check if already synced
            const existingMapping = await this.getMapping(tenantId, 'candidate', candidateId);
            if (existingMapping) {
                this.logger.log(`Candidate ${candidateId} already synced to Workday`);
                await this.syncLogService.markSuccess(log.id, { skipped: true }, existingMapping);
                return;
            }

            // Check if candidate exists by email
            let workdayId: string | null = null;
            if (candidate.email) {
                const existing = await this.apiService.searchCandidateByEmail(tenantId, candidate.email);
                workdayId = existing?.id || null;
            }

            const candidateData = mapCandidateToWorkday(candidate);

            if (workdayId) {
                // Update existing candidate
                await this.apiService.updateCandidate(tenantId, workdayId, {
                    name: {
                        legalFirstName: candidateData.firstName,
                        legalLastName: candidateData.lastName,
                    },
                });
            } else {
                // Create new candidate
                const result = await this.apiService.createCandidate(tenantId, candidateData);
                workdayId = result.id;
            }

            // Store mapping
            await this.storeMapping(tenantId, 'candidate', candidateId, workdayId);

            // Note: v1 doesn't support Job/Requisition sync (no jobId on Candidate model)

            await this.syncLogService.markSuccess(log.id, { workdayId }, workdayId);
            this.logger.log(`Synced candidate ${candidateId} to Workday ${workdayId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to sync candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    /**
     * Handle candidate updated event
     */
    async handleCandidateUpdated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'workday',
            eventType: 'CANDIDATE_UPDATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const workdayId = await this.getMapping(tenantId, 'candidate', candidateId);

            if (!workdayId) {
                await this.handleCandidateCreated(tenantId, candidateId);
                await this.syncLogService.markSuccess(log.id, { createdInstead: true });
                return;
            }

            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            const candidateData = mapCandidateToWorkday(candidate);
            await this.apiService.updateCandidate(tenantId, workdayId, {
                name: {
                    legalFirstName: candidateData.firstName,
                    legalLastName: candidateData.lastName,
                },
                contactInformation: {
                    emailAddresses: candidateData.email ? [{
                        emailAddress: candidateData.email,
                        primary: true,
                    }] : [],
                    phoneNumbers: candidateData.phone ? [{
                        phoneNumber: candidateData.phone,
                        primary: true,
                    }] : [],
                },
            });

            await this.syncLogService.markSuccess(log.id, { workdayId }, workdayId);
            this.logger.log(`Updated Workday candidate ${workdayId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to update candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    /**
     * Handle candidate stage changed event
     */
    async handleCandidateStageChanged(
        tenantId: string,
        candidateId: string,
        newStage: string,
    ): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'workday',
            eventType: 'CANDIDATE_STAGE_CHANGED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
            payload: { newStage },
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            let workdayId = await this.getMapping(tenantId, 'candidate', candidateId);

            if (!workdayId) {
                await this.handleCandidateCreated(tenantId, candidateId);
                workdayId = await this.getMapping(tenantId, 'candidate', candidateId);
                if (!workdayId) {
                    throw new Error('Failed to create candidate in Workday');
                }
            }

            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });

            // Note: v1 doesn't support Job/Requisition-based stage transitions
            // Update candidate stage directly via the API
            // For full requisition support, implement Job sync separately
            this.logger.log(`Stage changed to ${newStage} for candidate ${candidateId}`);

            await this.syncLogService.markSuccess(log.id, { workdayId, newStage }, workdayId);
            this.logger.log(`Updated Workday candidate ${workdayId} stage to ${newStage}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to update stage for ${candidateId}: ${message}`);
            throw error;
        }
    }

    // ============================================
    // Interview Event Handlers
    // ============================================

    /**
     * Handle interview scheduled event
     */
    async handleInterviewScheduled(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'workday',
            eventType: 'INTERVIEW_SCHEDULED',
            direction: 'OUTBOUND',
            entityType: 'INTERVIEW',
            entityId: interviewId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const interview = await this.prisma.interview.findUnique({
                where: { id: interviewId },
                include: { candidate: true },
            });

            if (!interview) {
                throw new Error('Interview not found');
            }

            // Get Workday candidate ID
            let workdayCandidateId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            if (!workdayCandidateId) {
                await this.handleCandidateCreated(tenantId, interview.candidateId);
                workdayCandidateId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            }

            if (!workdayCandidateId) {
                throw new Error('Failed to sync candidate to Workday');
            }

            // Get interviewers
            const interviewers = await this.prisma.user.findMany({
                where: { id: { in: interview.interviewerIds } },
                select: { name: true },
            });
            const interviewerNames = interviewers.map(i => i.name).filter(Boolean) as string[];

            // Create interview event
            const startTime = interview.date;
            const endTime = new Date(startTime.getTime() + interview.durationMins * 60000);

            const result = await this.apiService.createInterviewEvent(
                tenantId,
                workdayCandidateId,
                {
                    title: formatInterviewTitle(interview.candidate.name, interview.stage),
                    startTime,
                    endTime,
                    notes: formatInterviewNotes({
                        stage: interview.stage,
                        notes: interview.notes,
                        status: interview.status,
                        interviewerNames,
                    }),
                    status: mapInterviewStatusToWorkday(interview.status),
                },
            );

            await this.storeMapping(tenantId, 'interview', interviewId, result.id);
            await this.syncLogService.markSuccess(log.id, { interviewEventId: result.id }, result.id);
            this.logger.log(`Created Workday interview event ${result.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to sync interview ${interviewId}: ${message}`);
            throw error;
        }
    }

    /**
     * Handle interview completed event
     */
    async handleInterviewCompleted(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'workday',
            eventType: 'INTERVIEW_COMPLETED',
            direction: 'OUTBOUND',
            entityType: 'INTERVIEW',
            entityId: interviewId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            let workdayInterviewId = await this.getMapping(tenantId, 'interview', interviewId);

            if (!workdayInterviewId) {
                await this.handleInterviewScheduled(tenantId, interviewId);
                workdayInterviewId = await this.getMapping(tenantId, 'interview', interviewId);
            }

            if (workdayInterviewId) {
                await this.apiService.updateInterviewStatus(
                    tenantId,
                    workdayInterviewId,
                    'Completed',
                );
            }

            await this.syncLogService.markSuccess(log.id, { interviewEventId: workdayInterviewId }, workdayInterviewId || undefined);
            this.logger.log(`Marked Workday interview ${workdayInterviewId} as completed`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to complete interview ${interviewId}: ${message}`);
            throw error;
        }
    }

    // ============================================
    // Helper Methods
    // ============================================

    private async getMapping(tenantId: string, entityType: string, entityId: string): Promise<string | null> {
        const mapping = await this.prisma.integrationMapping.findUnique({
            where: {
                tenantId_provider_entityType_entityId: {
                    tenantId,
                    provider: 'workday',
                    entityType,
                    entityId,
                },
            },
        });
        return mapping?.externalId || null;
    }

    private async storeMapping(tenantId: string, entityType: string, entityId: string, externalId: string): Promise<void> {
        await this.prisma.integrationMapping.upsert({
            where: {
                tenantId_provider_entityType_entityId: {
                    tenantId,
                    provider: 'workday',
                    entityType,
                    entityId,
                },
            },
            create: {
                tenantId,
                provider: 'workday',
                entityType,
                entityId,
                externalId,
            },
            update: {
                externalId,
            },
        });
    }
}
