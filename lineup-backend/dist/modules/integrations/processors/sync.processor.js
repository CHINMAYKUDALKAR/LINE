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
let SyncProcessor = SyncProcessor_1 = class SyncProcessor extends bullmq_1.WorkerHost {
    prisma;
    providerFactory;
    auditService;
    logger = new common_1.Logger(SyncProcessor_1.name);
    constructor(prisma, providerFactory, auditService) {
        super();
        this.prisma = prisma;
        this.providerFactory = providerFactory;
        this.auditService = auditService;
    }
    async process(job) {
        const { tenantId, provider, since, triggeredBy } = job.data;
        this.logger.log(`Processing sync job for tenant ${tenantId}, provider ${provider}`);
        try {
            const providerInstance = this.providerFactory.getProvider(provider);
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
                        this.logger.warn(`Failed to upsert candidate: ${err.message}`);
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
            this.logger.error(`Sync job failed for tenant ${tenantId}, provider ${provider}`, error);
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
        audit_service_1.AuditService])
], SyncProcessor);
//# sourceMappingURL=sync.processor.js.map