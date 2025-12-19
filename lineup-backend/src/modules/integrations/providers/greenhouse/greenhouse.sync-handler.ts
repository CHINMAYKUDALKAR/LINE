import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma.service';
import { GreenhouseApiService } from './greenhouse.api';
import { SyncLogService } from '../../services/sync-log.service';
import { splitName, formatInterviewNote, mapStageToGreenhouse } from './greenhouse.mapping';

@Injectable()
export class GreenhouseSyncHandler {
    private readonly logger = new Logger(GreenhouseSyncHandler.name);

    constructor(
        private prisma: PrismaService,
        private apiService: GreenhouseApiService,
        private syncLogService: SyncLogService,
    ) { }

    async handleCandidateCreated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'greenhouse',
            eventType: 'CANDIDATE_CREATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
            if (!candidate) throw new Error('Candidate not found');

            const existingMapping = await this.getMapping(tenantId, 'candidate', candidateId);
            if (existingMapping) {
                await this.syncLogService.markSuccess(log.id, { skipped: true }, existingMapping);
                return;
            }

            let greenhouseId: string | null = null;
            if (candidate.email) {
                const existing = await this.apiService.searchCandidateByEmail(tenantId, candidate.email);
                greenhouseId = existing?.id || null;
            }

            const { firstName, lastName } = splitName(candidate.name);

            if (greenhouseId) {
                await this.apiService.updateCandidate(tenantId, greenhouseId, {
                    first_name: firstName,
                    last_name: lastName,
                });
            } else {
                const result = await this.apiService.createCandidate(tenantId, {
                    firstName,
                    lastName,
                    email: candidate.email || undefined,
                    phone: candidate.phone || undefined,
                });
                greenhouseId = result.id;
            }

            await this.storeMapping(tenantId, 'candidate', candidateId, greenhouseId);
            await this.syncLogService.markSuccess(log.id, { greenhouseId }, greenhouseId);
            this.logger.log(`Synced candidate ${candidateId} to Greenhouse ${greenhouseId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            throw error;
        }
    }

    async handleCandidateUpdated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'greenhouse',
            eventType: 'CANDIDATE_UPDATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const greenhouseId = await this.getMapping(tenantId, 'candidate', candidateId);
            if (!greenhouseId) {
                await this.handleCandidateCreated(tenantId, candidateId);
                await this.syncLogService.markSuccess(log.id, { createdInstead: true });
                return;
            }

            const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
            if (!candidate) throw new Error('Candidate not found');

            const { firstName, lastName } = splitName(candidate.name);
            await this.apiService.updateCandidate(tenantId, greenhouseId, {
                first_name: firstName,
                last_name: lastName,
            });

            await this.syncLogService.markSuccess(log.id, { greenhouseId }, greenhouseId);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            throw error;
        }
    }

    async handleCandidateStageChanged(tenantId: string, candidateId: string, newStage: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'greenhouse',
            eventType: 'CANDIDATE_STAGE_CHANGED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
            payload: { newStage },
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            let greenhouseId = await this.getMapping(tenantId, 'candidate', candidateId);
            if (!greenhouseId) {
                await this.handleCandidateCreated(tenantId, candidateId);
                greenhouseId = await this.getMapping(tenantId, 'candidate', candidateId);
            }

            if (greenhouseId) {
                const ghStage = mapStageToGreenhouse(newStage);
                await this.apiService.addNote(tenantId, greenhouseId, `Stage changed to: ${ghStage} (Lineup: ${newStage})`);
            }

            await this.syncLogService.markSuccess(log.id, { greenhouseId, newStage }, greenhouseId || undefined);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            throw error;
        }
    }

    async handleInterviewScheduled(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'greenhouse',
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
            if (!interview) throw new Error('Interview not found');

            let greenhouseId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            if (!greenhouseId) {
                await this.handleCandidateCreated(tenantId, interview.candidateId);
                greenhouseId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            }

            if (!greenhouseId) throw new Error('Failed to sync candidate');

            const interviewers = await this.prisma.user.findMany({
                where: { id: { in: interview.interviewerIds } },
                select: { name: true },
            });

            const note = formatInterviewNote({
                stage: interview.stage,
                notes: interview.notes,
                status: interview.status,
                date: interview.date,
                interviewerNames: interviewers.map(i => i.name).filter(Boolean) as string[],
            });

            const result = await this.apiService.addNote(tenantId, greenhouseId, note);
            await this.storeMapping(tenantId, 'interview', interviewId, result.id);
            await this.syncLogService.markSuccess(log.id, { noteId: result.id }, result.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            throw error;
        }
    }

    async handleInterviewCompleted(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'greenhouse',
            eventType: 'INTERVIEW_COMPLETED',
            direction: 'OUTBOUND',
            entityType: 'INTERVIEW',
            entityId: interviewId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            const interview = await this.prisma.interview.findUnique({ where: { id: interviewId } });
            if (!interview) throw new Error('Interview not found');

            const greenhouseId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
            if (greenhouseId) {
                await this.apiService.addNote(tenantId, greenhouseId, `✅ Interview Completed: ${interview.stage || 'Interview'}`);
            }

            await this.syncLogService.markSuccess(log.id, { greenhouseId }, greenhouseId || undefined);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            throw error;
        }
    }

    private async getMapping(tenantId: string, entityType: string, entityId: string): Promise<string | null> {
        const mapping = await this.prisma.integrationMapping.findUnique({
            where: { tenantId_provider_entityType_entityId: { tenantId, provider: 'greenhouse', entityType, entityId } },
        });
        return mapping?.externalId || null;
    }

    private async storeMapping(tenantId: string, entityType: string, entityId: string, externalId: string): Promise<void> {
        await this.prisma.integrationMapping.upsert({
            where: { tenantId_provider_entityType_entityId: { tenantId, provider: 'greenhouse', entityType, entityId } },
            create: { tenantId, provider: 'greenhouse', entityType, entityId, externalId },
            update: { externalId },
        });
    }
}
