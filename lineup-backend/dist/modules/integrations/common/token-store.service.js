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
exports.TokenStoreService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const token_encryption_util_1 = require("./token-encryption.util");
let TokenStoreService = class TokenStoreService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveTokens(tenantId, provider, tokens) {
        const toStore = { ...tokens };
        if (toStore.access_token)
            toStore.access_token = (0, token_encryption_util_1.encryptToken)(toStore.access_token);
        if (toStore.refresh_token)
            toStore.refresh_token = (0, token_encryption_util_1.encryptToken)(toStore.refresh_token);
        await this.prisma.integration.upsert({
            where: { tenantId_provider: { tenantId, provider } },
            create: { tenantId, provider, tokens: toStore, status: 'active' },
            update: { tokens: toStore, status: 'active' }
        });
    }
    async getDecryptedToken(tenantId, provider) {
        const integ = await this.prisma.integration.findFirst({ where: { tenantId, provider } });
        if (!integ || !integ.tokens)
            throw new common_1.BadRequestException('Integration not configured');
        const tokens = (integ.tokens ? { ...integ.tokens } : {});
        if (tokens.access_token)
            tokens.access_token = (0, token_encryption_util_1.decryptToken)(tokens.access_token);
        if (tokens.refresh_token)
            tokens.refresh_token = (0, token_encryption_util_1.decryptToken)(tokens.refresh_token);
        return tokens;
    }
};
exports.TokenStoreService = TokenStoreService;
exports.TokenStoreService = TokenStoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TokenStoreService);
//# sourceMappingURL=token-store.service.js.map