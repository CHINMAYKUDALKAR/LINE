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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoOAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const axios_1 = __importDefault(require("axios"));
let ZohoOAuthService = class ZohoOAuthService {
    prisma;
    clientId = process.env.ZOHO_CLIENT_ID;
    clientSecret = process.env.ZOHO_CLIENT_SECRET;
    tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
    constructor(prisma) {
        this.prisma = prisma;
    }
    getAuthUrl(tenantId, redirectUri) {
        return `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${this.clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}&state=${tenantId}`;
    }
    async exchangeCode(tenantId, code, redirectUri) {
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('client_id', this.clientId || '');
        params.append('client_secret', this.clientSecret || '');
        params.append('grant_type', 'authorization_code');
        const res = await axios_1.default.post(this.tokenUrl, params);
        if (!res.data.access_token)
            throw new common_1.BadRequestException('Invalid auth code');
        await this.prisma.integration.upsert({
            where: { tenantId_provider: { tenantId, provider: 'zoho' } },
            create: {
                tenantId,
                provider: 'zoho',
                tokens: res.data,
                status: 'active'
            },
            update: {
                tokens: res.data,
                status: 'active'
            }
        });
        return { success: true };
    }
    async refreshToken(tenantId) {
        const integ = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' }
        });
        const tokens = integ?.tokens;
        if (!integ || !tokens?.refresh_token)
            throw new common_1.BadRequestException('No Zoho integration found');
        const params = new URLSearchParams();
        params.append('client_id', this.clientId || '');
        params.append('client_secret', this.clientSecret || '');
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', tokens.refresh_token);
        const res = await axios_1.default.post(this.tokenUrl, params);
        const newTokens = { ...tokens, access_token: res.data.access_token };
        if (res.data.refresh_token)
            newTokens.refresh_token = res.data.refresh_token;
        await this.prisma.integration.update({
            where: { id: integ.id },
            data: { tokens: newTokens }
        });
        return newTokens.access_token;
    }
    async getAccessToken(tenantId) {
        const integ = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' }
        });
        const tokens = integ?.tokens;
        if (!integ || !tokens?.access_token)
            throw new common_1.BadRequestException('Zoho integration not configured');
        return tokens.access_token;
    }
};
exports.ZohoOAuthService = ZohoOAuthService;
exports.ZohoOAuthService = ZohoOAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZohoOAuthService);
//# sourceMappingURL=zoho.oauth.service.js.map