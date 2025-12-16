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
var DlqProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlqProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const audit_service_1 = require("../../audit/audit.service");
let DlqProcessor = DlqProcessor_1 = class DlqProcessor extends bullmq_1.WorkerHost {
    prisma;
    auditService;
    logger = new common_1.Logger(DlqProcessor_1.name);
    constructor(prisma, auditService) {
        super();
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async process(job) {
        const { tenantId, provider } = job.data;
        this.logger.error(`Job ${job.id} permanently failed for tenant ${tenantId}, provider ${provider}`);
        try {
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider,
                    },
                },
                data: {
                    lastError: `Sync permanently failed after ${job.attemptsMade} attempts: ${job.failedReason}`,
                    status: 'error',
                },
            });
            await this.auditService.log({
                tenantId,
                userId: null,
                action: 'integration.sync.permanent_failure',
                metadata: {
                    provider,
                    jobId: job.id,
                    attempts: job.attemptsMade,
                    error: job.failedReason,
                },
            });
            const admins = await this.prisma.user.findMany({
                where: {
                    tenantId,
                    role: 'ADMIN',
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });
            if (admins.length > 0) {
                this.logger.log(`Notifying ${admins.length} admin(s) about integration failure: ${admins.map(a => a.email).join(', ')}`);
                for (const admin of admins) {
                    await this.prisma.auditLog.create({
                        data: {
                            tenantId,
                            userId: admin.id,
                            action: 'SYSTEM_NOTIFICATION',
                            metadata: {
                                type: 'integration_failure',
                                title: `${provider} Integration Sync Failed`,
                                message: `The ${provider} integration has permanently failed after ${job.attemptsMade} attempts. Please check the integration settings.`,
                                severity: 'error',
                            },
                        },
                    });
                }
            }
            return { success: true, logged: true, adminsNotified: admins.length };
        }
        catch (error) {
            this.logger.error(`Failed to process DLQ job ${job.id}`, error);
            throw error;
        }
    }
    onFailed(job, error) {
        this.logger.error(`Job ${job.id} failed permanently:`, error.message);
    }
};
exports.DlqProcessor = DlqProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], DlqProcessor.prototype, "onFailed", null);
exports.DlqProcessor = DlqProcessor = DlqProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('integration-dlq'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], DlqProcessor);
//# sourceMappingURL=dlq.processor.js.map