import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma.service';
import { LeverApiService } from './lever.api';
import { SyncLogService } from '../../services/sync-log.service';
import { mapStageToLever, formatInterviewNote } from './lever.mapping';

/**
 * Lever Sync Handler
 *
 * Event-driven synchronization from Lineup to Lever.
 * Lever calls candidates "Opportunities"
 */
@Injectable()
export class LeverSyncHandler {
    private readonly logger = new Logger(LeverSyncHandler.name);

    constructor(
        private prisma: PrismaService,
        private apiService: LeverApiService,
        private syncLogService: SyncLogService,
    ) { }

    // ============================================
    // Candidate Event Handlers
    // ============================================

    async handleCandidateCreated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'lever',
            eventType: 'CANDIDATE_CREATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Check if already synced
            const existingMapping = await this.getMapping(tenantId, 'candidate', candidateId);
            if (existingMapping) {
                this.logger.log(`Candidate ${candidateId} already synced to Lever`);
                await this.syncLogService.markSuccess(log.id, { skipped: true }, existingMapping);
                return;
            }

            // Check if opportunity exists by email
            let leverId: string | null = null;
            if (candidate.email) {
                const existing = await this.apiService.searchOpportunityByEmail(tenantId, candidate.email);
                leverId = existing?.id || null;
            }

            if (leverId) {
                // Update existing opportunity
                await this.apiService.updateOpportunity(tenantId, leverId, {
                    name: candidate.name,
                    emails: candidate.email ? [candidate.email] : [],
                    phones: candidate.phone ? [{ value: candidate.phone }] : [],
                });
            } else {
                // Create new opportunity
                const result = await this.apiService.createOpportunity(tenantId, {
                    name: candidate.name,
                    email: candidate.email || undefined,
                    phone: candidate.phone || undefined,
                    origin: candidate.source || 'Lineup',
                    stage: candidate.stage ? mapStageToLever(candidate.stage) : undefined,
                });
                leverId = result.id;
            }

            await this.storeMapping(tenantId, 'candidate', candidateId, leverId);

            await this.syncLogService.markSuccess(log.id, { leverId }, leverId);
            this.logger.log(`Synced candidate ${candidateId} to Lever ${leverId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to sync candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    async handleCandidateUpdated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'lever',
            eventType: 'CANDIDATE_UPDATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const leverId = await this.getMapping(tenantId, 'candidate', candidateId);

            if (!leverId) {
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

            await this.apiService.updateOpportunity(tenantId, leverId, {
                name: candidate.name,
                emails: candidate.email ? [candidate.email] : [],
                phones: candidate.phone ? [{ value: candidate.phone }] : [],
            });

            await this.syncLogService.markSuccess(log.id, { leverId }, leverId);
            this.logger.log(`Updated Lever opportunity ${leverId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to update candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    async handleCandidateStageChanged(
        tenantId: string,
        candidateId: string,
        newStage: string,
    ): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'lever',
            eventType: 'CANDIDATE_STAGE_CHANGED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
            payload: { newStage },
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            let leverId = await this.getMapping(tenantId, 'candidate', candidateId);

            if (!leverId) {
                await this.handleCandidateCreated(tenantId, candidateId);
                leverId = await this.getMapping(tenantId, 'candidate', candidateId);
                if (!leverId) {
                    throw new Error('Failed to create candidate in Lever');
                }
            }

            // Note: Lever stage updates require stage IDs which are account-specific
            // For v1, we log the stage change as a note
            const leverStage = mapStageToLever(newStage);
            await this.apiService.addNote(tenantId, leverId, {
                value: `Stage changed to: ${leverStage} (from Lineup stage: ${newStage})`,
            });

            await this.syncLogService.markSuccess(log.id, { leverId, newStage }, leverId);
            this.logger.log(`Updated Lever opportunity ${leverId} stage to ${newStage}`);
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

    async handleInterviewScheduled(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'lever',
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

            // Get Lever opportunity ID
            let leverId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            if (!leverId) {
                await this.handleCandidateCreated(tenantId, interview.candidateId);
                leverId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            }

            if (!leverId) {
                throw new Error('Failed to sync candidate to Lever');
            }

            // Get interviewers
            const interviewers = await this.prisma.user.findMany({
                where: { id: { in: interview.interviewerIds } },
                select: { name: true },
            });
            const interviewerNames = interviewers.map(i => i.name).filter(Boolean) as string[];

            // Add interview as a note
            const noteContent = formatInterviewNote({
                stage: interview.stage,
                notes: interview.notes,
                status: interview.status,
                date: interview.date,
                interviewerNames,
            });

            const result = await this.apiService.addNote(tenantId, leverId, {
                value: noteContent,
            });

            await this.storeMapping(tenantId, 'interview', interviewId, result.id);
            await this.syncLogService.markSuccess(log.id, { noteId: result.id }, result.id);
            this.logger.log(`Created Lever note ${result.id} for interview`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to sync interview ${interviewId}: ${message}`);
            throw error;
        }
    }

    async handleInterviewCompleted(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'lever',
            eventType: 'INTERVIEW_COMPLETED',
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

            const leverId = await this.getMapping(tenantId, 'candidate', interview.candidateId);

            if (leverId) {
                // Add completion note
                await this.apiService.addNote(tenantId, leverId, {
                    value: `✅ Interview Completed: ${interview.stage || 'Interview'}\nStatus: ${interview.status}`,
                });
            }

            await this.syncLogService.markSuccess(log.id, { leverId }, leverId || undefined);
            this.logger.log(`Marked interview ${interviewId} as completed in Lever`);
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
                    provider: 'lever',
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
                    provider: 'lever',
                    entityType,
                    entityId,
                },
            },
            create: {
                tenantId,
                provider: 'lever',
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
