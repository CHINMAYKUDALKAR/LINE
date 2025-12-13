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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const provider_factory_1 = require("./provider.factory");
const oauth_util_1 = require("./utils/oauth.util");
const mapping_util_1 = require("./utils/mapping.util");
const audit_service_1 = require("../audit/audit.service");
let IntegrationsService = class IntegrationsService {
    prisma;
    providerFactory;
    auditService;
    syncQueue;
    constructor(prisma, providerFactory, auditService, syncQueue) {
        this.prisma = prisma;
        this.providerFactory = providerFactory;
        this.auditService = auditService;
        this.syncQueue = syncQueue;
    }
    async listIntegrations(tenantId) {
        const integrations = await this.prisma.integration.findMany({
            where: { tenantId },
            select: {
                id: true,
                provider: true,
                status: true,
                lastSyncedAt: true,
                lastError: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return integrations;
    }
    async getIntegration(tenantId, provider) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            select: {
                id: true,
                provider: true,
                status: true,
                settings: true,
                lastSyncedAt: true,
                lastError: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!integration) {
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        return integration;
    }
    async connect(tenantId, provider, userId) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        const providerInstance = this.providerFactory.getProvider(provider);
        const authUrl = await providerInstance.getAuthUrl(tenantId);
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.connect.initiated',
            metadata: { provider },
        });
        return { authUrl, provider };
    }
    async callback(provider, code, state, userId) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        const { tenantId } = (0, oauth_util_1.parseState)(state);
        const providerInstance = this.providerFactory.getProvider(provider);
        await providerInstance.exchangeCode(tenantId, code);
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.connect.completed',
            metadata: { provider },
        });
        return { success: true, provider };
    }
    async updateMapping(tenantId, provider, mappingDto, userId) {
        const newMapping = {
            mappings: mappingDto.mappings,
            direction: mappingDto.direction,
        };
        if (!(0, mapping_util_1.validateMapping)(newMapping)) {
            throw new common_1.BadRequestException('Invalid mapping configuration');
        }
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
        });
        if (!integration) {
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        const existingSettings = integration.settings || {};
        const existingMapping = existingSettings.mapping || { mappings: [], direction: 'bidirectional' };
        const mergedMapping = (0, mapping_util_1.mergeMappings)(existingMapping, newMapping);
        const updatedSettings = {
            ...existingSettings,
            mapping: mergedMapping,
        };
        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            data: {
                settings: updatedSettings,
            },
        });
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.mapping.updated',
            metadata: { provider, mappingCount: mergedMapping.mappings.length },
        });
        return { success: true, mapping: mergedMapping };
    }
    async syncNow(tenantId, provider, userId, since) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
        });
        if (!integration) {
            throw new common_1.NotFoundException(`Integration ${provider} not found`);
        }
        if (integration.status !== 'connected') {
            throw new common_1.BadRequestException(`Integration ${provider} is not connected`);
        }
        await this.syncQueue.add('sync', {
            tenantId,
            provider,
            since: since?.toISOString(),
        }, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.sync.triggered',
            metadata: { provider, since: since?.toISOString() },
        });
        return { success: true, message: 'Sync job enqueued' };
    }
    async handleWebhook(provider, payload) {
        if (!this.providerFactory.isSupported(provider)) {
            throw new common_1.BadRequestException(`Provider ${provider} is not supported`);
        }
        const tenantId = this.extractTenantFromWebhook(provider, payload);
        if (!tenantId) {
            throw new common_1.BadRequestException('Could not identify tenant from webhook');
        }
        const providerInstance = this.providerFactory.getProvider(provider);
        if (providerInstance.handleWebhook) {
            await providerInstance.handleWebhook(tenantId, payload);
        }
        await this.syncQueue.add('sync', {
            tenantId,
            provider,
            triggeredBy: 'webhook',
        });
        return { success: true };
    }
    async disconnect(tenantId, provider, userId) {
        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider,
                },
            },
            data: {
                status: 'pending',
                tokens: null,
            },
        });
        await this.auditService.log({
            tenantId,
            userId,
            action: 'integration.disconnected',
            metadata: { provider },
        });
        return { success: true };
    }
    extractTenantFromWebhook(provider, payload) {
        if (provider === 'zoho' && payload.organization_id) {
            return null;
        }
        if (provider === 'google_calendar' && payload.channelId) {
            return null;
        }
        if (provider === 'outlook_calendar' && payload.subscriptionId) {
            return null;
        }
        return null;
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_2.InjectQueue)('integration-sync')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        provider_factory_1.ProviderFactory,
        audit_service_1.AuditService,
        bullmq_1.Queue])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map