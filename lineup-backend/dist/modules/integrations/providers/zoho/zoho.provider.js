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
const zoho_mapping_1 = require("./zoho.mapping");
const mapping_util_1 = require("../../utils/mapping.util");
let ZohoProvider = class ZohoProvider {
    prisma;
    zohoOAuth;
    zohoApi;
    constructor(prisma, zohoOAuth, zohoApi) {
        this.prisma = prisma;
        this.zohoOAuth = zohoOAuth;
        this.zohoApi = zohoApi;
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
    async pushCandidate(tenantId, candidate) {
        try {
            const integration = await this.prisma.integration.findUnique({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
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
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
                data: {
                    lastError: `Push candidate failed: ${error.message}`,
                },
            });
            throw error;
        }
    }
    async pullCandidates(tenantId, since) {
        try {
            const integration = await this.prisma.integration.findUnique({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
            });
            const mappingConfig = (0, zoho_mapping_1.getZohoMapping)(integration?.settings);
            let zohoContacts;
            if (since) {
                zohoContacts = await this.zohoApi.getContactsSince(tenantId, since);
            }
            else {
                zohoContacts = await this.zohoApi.getContacts(tenantId);
            }
            const candidates = zohoContacts.map((contact) => (0, mapping_util_1.reverseMapping)(contact, mappingConfig));
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
                data: {
                    lastSyncedAt: new Date(),
                    lastError: null,
                },
            });
            return candidates;
        }
        catch (error) {
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'zoho',
                    },
                },
                data: {
                    lastError: `Pull candidates failed: ${error.message}`,
                },
            });
            throw error;
        }
    }
    async handleWebhook(tenantId, event) {
        const { module, operation, data } = event;
        if (module === 'Contacts') {
            if (operation === 'create' || operation === 'update') {
                console.log(`Zoho webhook: ${operation} contact for tenant ${tenantId}`);
            }
        }
        await this.prisma.integration.update({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider: 'zoho',
                },
            },
            data: {
                lastSyncedAt: new Date(),
            },
        });
    }
};
exports.ZohoProvider = ZohoProvider;
exports.ZohoProvider = ZohoProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zoho_oauth_1.ZohoOAuthService,
        zoho_api_1.ZohoApiService])
], ZohoProvider);
//# sourceMappingURL=zoho.provider.js.map