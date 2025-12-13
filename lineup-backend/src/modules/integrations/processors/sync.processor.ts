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

                // TODO: Process and save candidates to database
                // This would involve creating/updating Candidate records
                // For now, just log the count

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
                        triggeredBy,
                    },
                });

                return {
                    success: true,
                    candidatesCount: candidates.length,
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
