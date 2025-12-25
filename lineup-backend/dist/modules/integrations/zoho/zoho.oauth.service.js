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
var ZohoOAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoOAuthService = exports.ZohoAuthRequiredError = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const axios_1 = __importDefault(require("axios"));
const crypto_util_1 = require("../utils/crypto.util");
class ZohoAuthRequiredError extends Error {
    constructor(message = 'Zoho authentication required') {
        super(message);
        this.name = 'ZohoAuthRequiredError';
    }
}
exports.ZohoAuthRequiredError = ZohoAuthRequiredError;
let ZohoOAuthService = ZohoOAuthService_1 = class ZohoOAuthService {
    prisma;
    logger = new common_1.Logger(ZohoOAuthService_1.name);
    clientId = process.env.ZOHO_CLIENT_ID;
    clientSecret = process.env.ZOHO_CLIENT_SECRET;
    tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
    constructor(prisma) {
        this.prisma = prisma;
    }
    isAuthError(error) {
        if (error?.response?.status === 401)
            return true;
        if (error?.response?.status === 403)
            return true;
        const zohoError = error?.response?.data?.code || error?.response?.data?.error;
        const authErrors = [
            'INVALID_TOKEN',
            'AUTHENTICATION_FAILURE',
            'INVALID_OAUTH_TOKEN',
            'OAUTH_SCOPE_MISMATCH',
            'invalid_grant',
            'access_denied',
        ];
        if (zohoError && authErrors.includes(zohoError))
            return true;
        const message = error?.message?.toLowerCase() || '';
        if (message.includes('invalid token') || message.includes('authentication'))
            return true;
        return false;
    }
    async markAuthRequired(tenantId, reason) {
        this.logger.warn(`Marking Zoho integration as auth_required for tenant ${tenantId}: ${reason}`);
        await this.prisma.integration.updateMany({
            where: { tenantId, provider: 'zoho' },
            data: {
                status: 'auth_required',
                lastError: reason,
            },
        });
    }
    async isAuthRequired(tenantId) {
        const integration = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' },
            select: { status: true },
        });
        return integration?.status === 'auth_required';
    }
    getAuthUrl(tenantId, redirectUri) {
        return `https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${this.clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}&state=${tenantId}`;
    }
    async exchangeCode(tenantId, code, redirectUri) {
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('client_id', this.clientId || '');
        params.append('client_secret', this.clientSecret || '');
        params.append('grant_type', 'authorization_code');
        try {
            const res = await axios_1.default.post(this.tokenUrl, params);
            if (!res.data.access_token)
                throw new common_1.BadRequestException('Invalid auth code');
            await this.prisma.integration.upsert({
                where: { tenantId_provider: { tenantId, provider: 'zoho' } },
                create: {
                    tenantId,
                    provider: 'zoho',
                    tokens: res.data,
                    status: 'connected',
                    lastError: null,
                },
                update: {
                    tokens: res.data,
                    status: 'connected',
                    lastError: null,
                }
            });
            this.logger.log(`Zoho OAuth tokens exchanged successfully for tenant ${tenantId}`);
            return { success: true, reconnected: true };
        }
        catch (error) {
            this.logger.error(`Failed to exchange Zoho auth code: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to exchange auth code: ${error.message}`);
        }
    }
    async refreshToken(tenantId) {
        if (await this.isAuthRequired(tenantId)) {
            throw new ZohoAuthRequiredError('Zoho re-authentication required. Admin must reconnect.');
        }
        const integ = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' }
        });
        const tokens = integ?.tokens;
        if (!integ || !tokens?.refresh_token) {
            throw new common_1.BadRequestException('No Zoho integration found');
        }
        const params = new URLSearchParams();
        params.append('client_id', this.clientId || '');
        params.append('client_secret', this.clientSecret || '');
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', tokens.refresh_token);
        try {
            const res = await axios_1.default.post(this.tokenUrl, params);
            const newTokens = { ...tokens, access_token: res.data.access_token };
            if (res.data.refresh_token)
                newTokens.refresh_token = res.data.refresh_token;
            await this.prisma.integration.update({
                where: { id: integ.id },
                data: {
                    tokens: newTokens,
                    status: 'connected',
                    lastError: null,
                }
            });
            return newTokens.access_token;
        }
        catch (error) {
            if (this.isAuthError(error)) {
                const reason = 'Zoho OAuth token expired or revoked. Admin must reconnect.';
                await this.markAuthRequired(tenantId, reason);
                throw new ZohoAuthRequiredError(reason);
            }
            this.logger.error(`Failed to refresh Zoho token: ${error.message}`);
            throw error;
        }
    }
    async getAccessToken(tenantId) {
        if (await this.isAuthRequired(tenantId)) {
            throw new ZohoAuthRequiredError('Zoho re-authentication required. Admin must reconnect.');
        }
        const integ = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' }
        });
        if (!integ || !integ.tokens) {
            throw new common_1.BadRequestException('Zoho integration not configured');
        }
        const rawTokens = integ.tokens;
        let tokens;
        if (typeof rawTokens === 'string') {
            try {
                tokens = (0, crypto_util_1.decryptObject)(rawTokens);
                if (tokens.accessToken) {
                    return tokens.accessToken;
                }
            }
            catch (e) {
                throw new common_1.BadRequestException('Failed to decrypt Zoho tokens');
            }
        }
        else {
            tokens = rawTokens;
        }
        const accessToken = tokens?.accessToken || tokens?.access_token;
        if (!accessToken) {
            throw new common_1.BadRequestException('Zoho access token not found');
        }
        return accessToken;
    }
};
exports.ZohoOAuthService = ZohoOAuthService;
exports.ZohoOAuthService = ZohoOAuthService = ZohoOAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZohoOAuthService);
//# sourceMappingURL=zoho.oauth.service.js.map