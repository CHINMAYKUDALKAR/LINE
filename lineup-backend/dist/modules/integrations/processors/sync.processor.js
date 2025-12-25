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
var SyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const provider_factory_1 = require("../provider.factory");
const audit_service_1 = require("../../audit/audit.service");
const standard_entities_1 = require("../types/standard-entities");
const zoho_sync_service_1 = require("../zoho/zoho.sync.service");
let SyncProcessor = SyncProcessor_1 = class SyncProcessor extends bullmq_1.WorkerHost {
    prisma;
    providerFactory;
    auditService;
    zohoSyncService;
    logger = new common_1.Logger(SyncProcessor_1.name);
    constructor(prisma, providerFactory, auditService, zohoSyncService) {
        super();
        this.prisma = prisma;
        this.providerFactory = providerFactory;
        this.auditService = auditService;
        this.zohoSyncService = zohoSyncService;
    }
    async process(job) {
        if (job.name === 'integration-event') {
            return this.processEventJob(job.data);
        }
        return this.processFullSyncJob(job.data);
    }
    async processEventJob(data) {
        const { tenantId, provider, eventType, entityType, entityId, triggeredBy } = data;
        this.logger.log(`Processing integration event: ${eventType} for ${entityType}/${entityId} to ${provider}`);
        try {
            const providerInstance = this.providerFactory.getProvider(provider);
            switch (entityType) {
                case standard_entities_1.SyncEntityType.CANDIDATE:
                    await this.syncCandidateEvent(providerInstance, tenantId, entityId, eventType, data.data);
                    break;
                case standard_entities_1.SyncEntityType.INTERVIEW:
                    await this.syncInterviewEvent(providerInstance, tenantId, entityId, eventType);
                    break;
                case standard_entities_1.SyncEntityType.JOB:
                    this.logger.debug(`Job sync not yet implemented for ${provider}`);
                    break;
                default:
                    this.logger.warn(`Unknown entity type: ${entityType}`);
            }
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: { tenantId, provider },
                },
                data: {
                    lastSyncedAt: new Date(),
                    lastError: null,
                },
            });
            return { success: true, eventType, entityType, entityId };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Event sync failed for ${eventType}/${entityId} to ${provider}: ${errorMessage}`);
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: { tenantId, provider },
                },
                data: {
                    lastError: `Event sync failed: ${errorMessage}`,
                },
            });
            throw error;
        }
    }
    async syncCandidateEvent(provider, tenantId, candidateId, eventType, data) {
        if (typeof provider.syncCandidate === 'function') {
            const syncableProvider = provider;
            switch (eventType) {
                case standard_entities_1.IntegrationEventType.CANDIDATE_CREATED:
                    await syncableProvider.syncCandidate(tenantId, candidateId, 'created');
                    break;
                case standard_entities_1.IntegrationEventType.CANDIDATE_UPDATED:
                    await syncableProvider.syncCandidate(tenantId, candidateId, 'updated');
                    break;
                case standard_entities_1.IntegrationEventType.CANDIDATE_STAGE_CHANGED:
                    const newStage = data?.newStage;
                    await syncableProvider.syncCandidate(tenantId, candidateId, 'stage_changed', { newStage });
                    break;
                default:
                    this.logger.debug(`Unhandled candidate event type: ${eventType}`);
            }
        }
        else if (provider.pushCandidate) {
            const candidate = await this.prisma.candidate.findUnique({
                where: { id: candidateId },
            });
            if (candidate) {
                await provider.pushCandidate(tenantId, candidate);
            }
        }
    }
    async syncInterviewEvent(provider, tenantId, interviewId, eventType) {
        if (typeof provider.syncInterview === 'function') {
            const syncableProvider = provider;
            switch (eventType) {
                case standard_entities_1.IntegrationEventType.INTERVIEW_SCHEDULED:
                case standard_entities_1.IntegrationEventType.INTERVIEW_RESCHEDULED:
                    await syncableProvider.syncInterview(tenantId, interviewId, 'scheduled');
                    break;
                case standard_entities_1.IntegrationEventType.INTERVIEW_COMPLETED:
                    await syncableProvider.syncInterview(tenantId, interviewId, 'completed');
                    break;
                case standard_entities_1.IntegrationEventType.INTERVIEW_CANCELLED:
                    this.logger.debug(`Interview cancelled sync not yet implemented`);
                    break;
                default:
                    this.logger.debug(`Unhandled interview event type: ${eventType}`);
            }
        }
        else if (provider.pushInterview) {
            const interview = await this.prisma.interview.findUnique({
                where: { id: interviewId },
                include: { candidate: true },
            });
            if (interview) {
                await provider.pushInterview(tenantId, {
                    internalId: interview.id,
                    candidateId: interview.candidateId,
                    interviewerIds: interview.interviewerIds,
                    startAt: interview.date,
                    durationMins: interview.durationMins,
                    stage: interview.stage,
                    status: interview.status,
                    meetingLink: interview.meetingLink || undefined,
                    notes: interview.notes || undefined,
                });
            }
        }
    }
    async processFullSyncJob(data) {
        const { tenantId, provider, since, triggeredBy } = data;
        this.logger.log(`Processing full sync job for tenant ${tenantId}, provider ${provider}`);
        const integration = await this.prisma.integration.findFirst({
            where: { tenantId, provider },
            select: { status: true },
        });
        if (integration?.status === 'auth_required') {
            this.logger.warn(`Skipping sync for ${provider} - authentication required. Admin must reconnect.`);
            return {
                success: false,
                skipped: true,
                reason: 'Authentication required. Admin must reconnect.',
            };
        }
        try {
            const providerInstance = this.providerFactory.getProvider(provider);
            if (provider === 'zoho') {
                const module = data.module || 'leads';
                this.logger.log(`Using ZohoSyncService for inbound sync (module: ${module})`);
                const result = await this.zohoSyncService.syncAll(tenantId, module);
                await this.auditService.log({
                    tenantId,
                    userId: null,
                    action: 'integration.sync.completed',
                    metadata: {
                        provider,
                        ...result,
                        triggeredBy,
                    },
                });
                return { success: true, ...result };
            }
            if (providerInstance.pullCandidates) {
                const sinceDate = since ? new Date(since) : undefined;
                const candidates = await providerInstance.pullCandidates(tenantId, sinceDate);
                this.logger.log(`Pulled ${candidates.length} candidates from ${provider}`);
                let created = 0;
                let updated = 0;
                let skipped = 0;
                for (const candidate of candidates) {
                    try {
                        let existing = null;
                        if (candidate.email) {
                            existing = await this.prisma.candidate.findFirst({
                                where: {
                                    tenantId,
                                    email: candidate.email,
                                },
                            });
                        }
                        if (!existing && candidate.phone) {
                            existing = await this.prisma.candidate.findFirst({
                                where: {
                                    tenantId,
                                    phone: candidate.phone,
                                },
                            });
                        }
                        if (existing) {
                            await this.prisma.candidate.update({
                                where: { id: existing.id },
                                data: {
                                    name: candidate.name || existing.name,
                                    email: candidate.email || existing.email,
                                    phone: candidate.phone || existing.phone,
                                    source: candidate.source || existing.source,
                                    notes: candidate.notes ? `${existing.notes || ''}\n\n[Sync ${new Date().toISOString()}]: ${candidate.notes}` : existing.notes,
                                },
                            });
                            updated++;
                        }
                        else {
                            await this.prisma.candidate.create({
                                data: {
                                    tenantId,
                                    name: candidate.name || 'Unknown',
                                    email: candidate.email,
                                    phone: candidate.phone,
                                    source: candidate.source || provider,
                                    stage: 'applied',
                                    notes: candidate.notes,
                                    tags: [`sync:${provider}`],
                                },
                            });
                            created++;
                        }
                    }
                    catch (err) {
                        const errMessage = err instanceof Error ? err.message : 'Unknown error';
                        this.logger.warn(`Failed to upsert candidate: ${errMessage}`);
                        skipped++;
                    }
                }
                this.logger.log(`Sync complete: created=${created}, updated=${updated}, skipped=${skipped}`);
                await this.prisma.integration.update({
                    where: {
                        tenantId_provider: {
                            tenantId,
                            provider,
                        },
                    },
                    data: {
                        lastSyncedAt: new Date(),
                        lastError: null,
                    },
                });
                await this.auditService.log({
                    tenantId,
                    userId: null,
                    action: 'integration.sync.completed',
                    metadata: {
                        provider,
                        candidatesCount: candidates.length,
                        created,
                        updated,
                        skipped,
                        triggeredBy,
                    },
                });
                return {
                    success: true,
                    candidatesCount: candidates.length,
                    created,
                    updated,
                    skipped,
                };
            }
            return { success: true, message: 'No sync action available' };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Sync job failed for tenant ${tenantId}, provider ${provider}`, error);
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider,
                    },
                },
                data: {
                    lastError: errorMessage,
                },
            });
            await this.auditService.log({
                tenantId,
                userId: null,
                action: 'integration.sync.failed',
                metadata: {
                    provider,
                    error: errorMessage,
                    triggeredBy,
                },
            });
            throw error;
        }
    }
};
exports.SyncProcessor = SyncProcessor;
exports.SyncProcessor = SyncProcessor = SyncProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('integration-sync'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        provider_factory_1.ProviderFactory,
        audit_service_1.AuditService,
        zoho_sync_service_1.ZohoSyncService])
], SyncProcessor);
//# sourceMappingURL=sync.processor.js.map