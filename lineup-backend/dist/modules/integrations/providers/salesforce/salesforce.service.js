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
var SalesforceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesforceService = void 0;
const common_1 = require("@nestjs/common");
const token_store_service_1 = require("../../common/token-store.service");
let SalesforceService = SalesforceService_1 = class SalesforceService {
    tokenStore;
    logger = new common_1.Logger(SalesforceService_1.name);
    provider = 'salesforce';
    constructor(tokenStore) {
        this.tokenStore = tokenStore;
    }
    async init(tenantId) {
        this.logger.log(`Initializing Salesforce for ${tenantId}`);
    }
    async getAccessToken(tenantId) {
        const tokens = await this.tokenStore.getDecryptedToken(tenantId, this.provider);
        return tokens.access_token;
    }
    async refreshToken(tenantId) {
        this.logger.log(`Refreshing Salesforce token for ${tenantId}`);
    }
    async pushRecord(tenantId, record) {
        this.logger.log(`Pushing record to Salesforce for ${tenantId}`);
        return { success: true, id: 'salesforce-id' };
    }
    async pullChanges(tenantId, since) {
        this.logger.log(`Pulling changes from Salesforce for ${tenantId} since ${since}`);
        return [];
    }
    async handleWebhook(tenantId, payload) {
        this.logger.log(`Handling Salesforce webhook for ${tenantId}`, payload);
        return { received: true };
    }
};
exports.SalesforceService = SalesforceService;
exports.SalesforceService = SalesforceService = SalesforceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_store_service_1.TokenStoreService])
], SalesforceService);
//# sourceMappingURL=salesforce.service.js.map