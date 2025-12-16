import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ProviderFactory } from '../provider.factory';
import { AuditService } from '../../audit/audit.service';

interface SyncJobData {
    tenantId: string;
    provider: string;
    since?: string;
    triggeredBy?: string;
}

@Processor('integration-sync')
@Injectable()
export class SyncProcessor extends WorkerHost {
    private readonly logger = new Logger(SyncProcessor.name);

    constructor(
        private prisma: PrismaService,
        private providerFactory: ProviderFactory,
        private auditService: AuditService,
    ) {
        super();
    }

    async process(job: Job<SyncJobData>): Promise<any> {
        const { tenantId, provider, since, triggeredBy } = job.data;

        this.logger.log(
            `Processing sync job for tenant ${tenantId}, provider ${provider}`,
        );

        try {
            const providerInstance = this.providerFactory.getProvider(provider);

            // Pull candidates from provider
            if (providerInstance.pullCandidates) {
                const sinceDate = since ? new Date(since) : undefined;
                const candidates = await providerInstance.pullCandidates(
                    tenantId,
                    sinceDate,
                );

                this.logger.log(
                    `Pulled ${candidates.length} candidates from ${provider}`,
                );

                // Process and save candidates to database
                let created = 0;
                let updated = 0;
                let skipped = 0;

                for (const candidate of candidates) {
                    try {
                        // Check if candidate already exists by email (primary identifier)
                        let existing = null;
                        if (candidate.email) {
                            existing = await this.prisma.candidate.findFirst({
                                where: {
                                    tenantId,
                                    email: candidate.email,
                                },
                            });
                        }

                        // If no email match, try phone
                        if (!existing && candidate.phone) {
                            existing = await this.prisma.candidate.findFirst({
                                where: {
                                    tenantId,
                                    phone: candidate.phone,
                                },
                            });
                        }

                        if (existing) {
                            // Update existing candidate
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
                        } else {
                            // Create new candidate
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
                    } catch (err) {
                        this.logger.warn(`Failed to upsert candidate: ${err.message}`);
                        skipped++;
                    }
                }

                this.logger.log(
                    `Sync complete: created=${created}, updated=${updated}, skipped=${skipped}`,
                );

                // Update integration status
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

                // Create audit log
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
        } catch (error) {
            this.logger.error(
                `Sync job failed for tenant ${tenantId}, provider ${provider}`,
                error,
            );

            // Update integration with error
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider,
                    },
                },
                data: {
                    lastError: error.message,
                },
            });

            // Create audit log for failure
            await this.auditService.log({
                tenantId,
                userId: null,
                action: 'integration.sync.failed',
                metadata: {
                    provider,
                    error: error.message,
                    triggeredBy,
                },
            });

            throw error; // Re-throw to trigger retry
        }
    }
}
