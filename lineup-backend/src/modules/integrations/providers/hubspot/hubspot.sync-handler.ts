import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma.service';
import { HubspotApiService } from './hubspot.api';
import { SyncLogService } from '../../services/sync-log.service';
import {
    mapCandidateToContact,
    mapStageToHubspotStatus,
    formatInterviewTitle,
    formatInterviewBody,
    mapInterviewStatusToOutcome,
} from './hubspot.mapping';

/**
 * HubSpot Sync Handler
 *
 * Handles event-driven synchronization from Lineup to HubSpot.
 * Called by the sync processor when integration events are queued.
 */
@Injectable()
export class HubspotSyncHandler {
    private readonly logger = new Logger(HubspotSyncHandler.name);

    constructor(
        private prisma: PrismaService,
        private apiService: HubspotApiService,
        private syncLogService: SyncLogService,
    ) { }

    // ============================================
    // Candidate Event Handlers
    // ============================================

    /**
     * Handle candidate created event
     * Creates a new Contact in HubSpot
     */
    async handleCandidateCreated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'hubspot',
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
                this.logger.log(`Candidate ${candidateId} already synced to HubSpot`);
                await this.syncLogService.markSuccess(log.id, { skipped: true }, existingMapping);
                return;
            }

            // Check if contact exists by email
            let hubspotId: string | null = null;
            if (candidate.email) {
                const existing = await this.apiService.searchContactByEmail(tenantId, candidate.email);
                hubspotId = existing?.id || null;
            }

            if (hubspotId) {
                // Update existing contact
                const contactProps = mapCandidateToContact(candidate);
                await this.apiService.updateContact(tenantId, hubspotId, contactProps);
            } else {
                // Create new contact
                const contactProps = mapCandidateToContact(candidate);
                const result = await this.apiService.createContact(tenantId, {
                    firstName: contactProps.firstname,
                    lastName: contactProps.lastname,
                    email: contactProps.email,
                    phone: contactProps.phone,
                    jobTitle: contactProps.jobtitle,
                    source: contactProps.leadsource,
                    stage: contactProps.hs_lead_status,
                });
                hubspotId = result.id;
            }

            // Store mapping
            await this.storeMapping(tenantId, 'candidate', candidateId, hubspotId);

            await this.syncLogService.markSuccess(log.id, { hubspotId }, hubspotId);
            this.logger.log(`Synced candidate ${candidateId} to HubSpot contact ${hubspotId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to sync candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    /**
     * Handle candidate updated event
     * Updates the corresponding Contact in HubSpot
     */
    async handleCandidateUpdated(tenantId: string, candidateId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'hubspot',
            eventType: 'CANDIDATE_UPDATED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            // Get HubSpot contact ID from mapping
            const hubspotId = await this.getMapping(tenantId, 'candidate', candidateId);

            if (!hubspotId) {
                // Not synced yet - create instead
                await this.handleCandidateCreated(tenantId, candidateId);
                await this.syncLogService.markSuccess(log.id, { createdInstead: true });
                return;
            }

            // Fetch candidate data
            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Update contact in HubSpot
            const contactProps = mapCandidateToContact(candidate);
            await this.apiService.updateContact(tenantId, hubspotId, contactProps);

            await this.syncLogService.markSuccess(log.id, { hubspotId }, hubspotId);
            this.logger.log(`Updated HubSpot contact ${hubspotId} for candidate ${candidateId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to update candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    /**
     * Handle candidate stage changed event
     * Updates the lead status in HubSpot
     */
    async handleCandidateStageChanged(
        tenantId: string,
        candidateId: string,
        newStage: string,
    ): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'hubspot',
            eventType: 'CANDIDATE_STAGE_CHANGED',
            direction: 'OUTBOUND',
            entityType: 'CANDIDATE',
            entityId: candidateId,
            payload: { newStage },
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            // Get HubSpot contact ID from mapping
            let hubspotId = await this.getMapping(tenantId, 'candidate', candidateId);

            if (!hubspotId) {
                // Not synced yet - create first
                await this.handleCandidateCreated(tenantId, candidateId);
                hubspotId = await this.getMapping(tenantId, 'candidate', candidateId);
                if (!hubspotId) {
                    throw new Error('Failed to create candidate in HubSpot');
                }
            }

            // Map stage to HubSpot lead status
            const hubspotStatus = mapStageToHubspotStatus(newStage);

            // Update contact in HubSpot
            await this.apiService.updateContact(tenantId, hubspotId, {
                hs_lead_status: hubspotStatus,
            });

            await this.syncLogService.markSuccess(log.id, { hubspotId, hubspotStatus }, hubspotId);
            this.logger.log(`Updated HubSpot contact ${hubspotId} stage to ${hubspotStatus}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to update stage for candidate ${candidateId}: ${message}`);
            throw error;
        }
    }

    // ============================================
    // Interview Event Handlers
    // ============================================

    /**
     * Handle interview scheduled event
     * Creates a Meeting activity in HubSpot
     */
    async handleInterviewScheduled(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'hubspot',
            eventType: 'INTERVIEW_SCHEDULED',
            direction: 'OUTBOUND',
            entityType: 'INTERVIEW',
            entityId: interviewId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            // Fetch interview with candidate
            const interview = await this.prisma.interview.findUnique({
                where: { id: interviewId },
                include: {
                    candidate: { select: { id: true, name: true } },
                },
            });

            if (!interview) {
                throw new Error('Interview not found');
            }

            // Get HubSpot contact ID for candidate
            let hubspotContactId = await this.getMapping(tenantId, 'candidate', interview.candidateId);

            if (!hubspotContactId) {
                // Candidate not synced - sync first
                await this.handleCandidateCreated(tenantId, interview.candidateId);
                hubspotContactId = await this.getMapping(tenantId, 'candidate', interview.candidateId);
                if (!hubspotContactId) {
                    throw new Error('Failed to sync candidate to HubSpot');
                }
            }

            // Fetch interviewer names
            const interviewers = await this.prisma.user.findMany({
                where: { id: { in: interview.interviewerIds } },
                select: { name: true },
            });
            const interviewerNames = interviewers.map(i => i.name).filter(Boolean) as string[];

            // Create meeting in HubSpot
            const startTime = interview.date;
            const endTime = new Date(startTime.getTime() + interview.durationMins * 60000);

            const result = await this.apiService.createMeeting(tenantId, hubspotContactId, {
                title: formatInterviewTitle(interview.candidate.name, interview.stage),
                startTime,
                endTime,
                body: formatInterviewBody({
                    stage: interview.stage,
                    notes: interview.notes,
                    status: interview.status,
                    interviewerNames,
                }),
                outcome: 'SCHEDULED',
            });

            // Store meeting mapping
            await this.storeMapping(tenantId, 'interview', interviewId, result.id);

            await this.syncLogService.markSuccess(log.id, { meetingId: result.id }, result.id);
            this.logger.log(`Created HubSpot meeting ${result.id} for interview ${interviewId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.syncLogService.markFailed(log.id, message, 0);
            this.logger.error(`Failed to sync interview ${interviewId}: ${message}`);
            throw error;
        }
    }

    /**
     * Handle interview completed event
     * Updates the Meeting outcome in HubSpot
     */
    async handleInterviewCompleted(tenantId: string, interviewId: string): Promise<void> {
        const log = await this.syncLogService.createLog({
            tenantId,
            provider: 'hubspot',
            eventType: 'INTERVIEW_COMPLETED',
            direction: 'OUTBOUND',
            entityType: 'INTERVIEW',
            entityId: interviewId,
        });

        try {
            await this.syncLogService.markInProgress(log.id);

            // Get HubSpot meeting ID from mapping
            let hubspotMeetingId = await this.getMapping(tenantId, 'interview', interviewId);

            if (!hubspotMeetingId) {
                // Meeting not synced - create it first
                await this.handleInterviewScheduled(tenantId, interviewId);
                hubspotMeetingId = await this.getMapping(tenantId, 'interview', interviewId);
            }

            if (hubspotMeetingId) {
                // Update meeting outcome to completed
                await this.apiService.updateMeeting(tenantId, hubspotMeetingId, {
                    hs_meeting_outcome: 'COMPLETED',
                });
            }

            await this.syncLogService.markSuccess(log.id, { meetingId: hubspotMeetingId }, hubspotMeetingId || undefined);
            this.logger.log(`Marked HubSpot meeting ${hubspotMeetingId} as completed`);
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

    /**
     * Get existing mapping from IntegrationMapping table
     */
    private async getMapping(
        tenantId: string,
        entityType: string,
        entityId: string,
    ): Promise<string | null> {
        const mapping = await this.prisma.integrationMapping.findUnique({
            where: {
                tenantId_provider_entityType_entityId: {
                    tenantId,
                    provider: 'hubspot',
                    entityType,
                    entityId,
                },
            },
        });

        return mapping?.externalId || null;
    }

    /**
     * Store mapping in IntegrationMapping table
     */
    private async storeMapping(
        tenantId: string,
        entityType: string,
        entityId: string,
        externalId: string,
    ): Promise<void> {
        await this.prisma.integrationMapping.upsert({
            where: {
                tenantId_provider_entityType_entityId: {
                    tenantId,
                    provider: 'hubspot',
                    entityType,
                    entityId,
                },
            },
            create: {
                tenantId,
                provider: 'hubspot',
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
