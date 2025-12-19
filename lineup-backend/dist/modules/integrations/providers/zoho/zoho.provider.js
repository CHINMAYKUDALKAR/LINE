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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../common/prisma.service");
const zoho_oauth_1 = require("./zoho.oauth");
const zoho_api_1 = require("./zoho.api");
const zoho_sync_handler_1 = require("./zoho.sync-handler");
const zoho_mapping_1 = require("./zoho.mapping");
const mapping_util_1 = require("../../utils/mapping.util");
const crypto_util_1 = require("../../utils/crypto.util");
let ZohoProvider = class ZohoProvider {
    prisma;
    zohoOAuth;
    zohoApi;
    zohoSync;
    constructor(prisma, zohoOAuth, zohoApi, zohoSync) {
        this.prisma = prisma;
        this.zohoOAuth = zohoOAuth;
        this.zohoApi = zohoApi;
        this.zohoSync = zohoSync;
    }
    getCapabilities() {
        return {
            candidateSync: 'push',
            jobSync: 'none',
            interviewSync: 'push',
            supportsWebhooks: false,
        };
    }
    async getAuthUrl(tenantId, state) {
        return this.zohoOAuth.getAuthUrl(tenantId);
    }
    async exchangeCode(tenantId, code) {
        await this.zohoOAuth.exchangeCode(tenantId, code);
    }
    async refreshTokens(tenantId) {
        await this.zohoOAuth.refreshTokens(tenantId);
    }
    async testConnection(tenantId) {
        return this.zohoApi.testConnection(tenantId);
    }
    async getStatus(tenantId) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: { tenantId, provider: 'zoho' },
            },
        });
        if (!integration) {
            return {
                connected: false,
                lastSyncAt: null,
                failureCount24h: 0,
                successCount24h: 0,
                tokenValid: false,
                lastError: null,
            };
        }
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const logs = await this.prisma.integrationSyncLog.groupBy({
            by: ['status'],
            where: {
                tenantId,
                provider: 'zoho',
                createdAt: { gte: since },
            },
            _count: true,
        });
        let successCount = 0;
        let failureCount = 0;
        for (const log of logs) {
            if (log.status === 'SUCCESS')
                successCount = log._count;
            if (log.status === 'FAILED')
                failureCount = log._count;
        }
        let tokenValid = false;
        if (integration.tokens) {
            try {
                const tokenSet = (0, crypto_util_1.decryptObject)(integration.tokens);
                tokenValid = !!(tokenSet.accessToken &&
                    (!tokenSet.expiresAt || Date.now() < tokenSet.expiresAt));
            }
            catch {
                tokenValid = false;
            }
        }
        return {
            connected: integration.status === 'connected',
            lastSyncAt: integration.lastSyncedAt,
            failureCount24h: failureCount,
            successCount24h: successCount,
            tokenValid,
            lastError: integration.lastError,
        };
    }
    async syncCandidate(tenantId, candidateId, eventType, data) {
        switch (eventType) {
            case 'created':
                await this.zohoSync.handleCandidateCreated(tenantId, candidateId);
                break;
            case 'updated':
                await this.zohoSync.handleCandidateUpdated(tenantId, candidateId);
                break;
            case 'stage_changed':
                if (data?.newStage) {
                    await this.zohoSync.handleStageChanged(tenantId, candidateId, data.newStage);
                }
                else {
                    await this.zohoSync.handleCandidateUpdated(tenantId, candidateId);
                }
                break;
        }
    }
    async syncInterview(tenantId, interviewId, eventType) {
        switch (eventType) {
            case 'scheduled':
                await this.zohoSync.handleInterviewScheduled(tenantId, interviewId);
                break;
            case 'completed':
                await this.zohoSync.handleInterviewCompleted(tenantId, interviewId);
                break;
        }
    }
    async pushCandidate(tenantId, candidate) {
        try {
            const integration = await this.prisma.integration.findUnique({
                where: { tenantId_provider: { tenantId, provider: 'zoho' } },
            });
            const mappingConfig = (0, zoho_mapping_1.getZohoMapping)(integration?.settings);
            const zohoContact = (0, mapping_util_1.applyMapping)(candidate, mappingConfig);
            if (candidate.email) {
                const existingContact = await this.zohoApi.searchContactByEmail(tenantId, candidate.email);
                if (existingContact) {
                    return await this.zohoApi.updateContact(tenantId, existingContact.id, zohoContact);
                }
            }
            return await this.zohoApi.createContact(tenantId, zohoContact);
        }
        catch (error) {
            await this.prisma.integration.update({
                where: { tenantId_provider: { tenantId, provider: 'zoho' } },
                data: { lastError: `Push candidate failed: ${error.message}` },
            });
            throw error;
        }
    }
    async pullCandidates(tenantId, since) {
        throw new Error('Inbound sync not supported in v1. Lineup is the system of record.');
    }
    async handleWebhook(tenantId, event) {
        console.log(`Zoho webhook received but ignored (v1 outbound only): ${event?.module}`);
    }
};
exports.ZohoProvider = ZohoProvider;
exports.ZohoProvider = ZohoProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zoho_oauth_1.ZohoOAuthService,
        zoho_api_1.ZohoApiService,
        zoho_sync_handler_1.ZohoSyncHandler])
], ZohoProvider);
//# sourceMappingURL=zoho.provider.js.map