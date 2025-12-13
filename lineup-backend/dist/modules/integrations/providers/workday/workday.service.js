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
var WorkdayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkdayService = void 0;
const common_1 = require("@nestjs/common");
const token_store_service_1 = require("../../common/token-store.service");
let WorkdayService = WorkdayService_1 = class WorkdayService {
    tokenStore;
    logger = new common_1.Logger(WorkdayService_1.name);
    provider = 'workday';
    constructor(tokenStore) {
        this.tokenStore = tokenStore;
    }
    async init(tenantId) {
        this.logger.log(`Initializing Workday for ${tenantId}`);
    }
    async getAccessToken(tenantId) {
        const tokens = await this.tokenStore.getDecryptedToken(tenantId, this.provider);
        return tokens.access_token;
    }
    async refreshToken(tenantId) {
        this.logger.log(`Refreshing Workday token for ${tenantId}`);
    }
    async pushRecord(tenantId, record) {
        this.logger.log(`Pushing record to Workday for ${tenantId}`);
        return { success: true, id: 'workday-id' };
    }
    async pullChanges(tenantId, since) {
        this.logger.log(`Pulling changes from Workday for ${tenantId} since ${since}`);
        return [];
    }
    async handleWebhook(tenantId, payload) {
        this.logger.log(`Handling Workday webhook for ${tenantId}`, payload);
        return { received: true };
    }
};
exports.WorkdayService = WorkdayService;
exports.WorkdayService = WorkdayService = WorkdayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_store_service_1.TokenStoreService])
], WorkdayService);
//# sourceMappingURL=workday.service.js.map