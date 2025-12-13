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
exports.OutlookOAuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../common/prisma.service");
const axios_1 = __importDefault(require("axios"));
const crypto_util_1 = require("../../utils/crypto.util");
const oauth_util_1 = require("../../utils/oauth.util");
let OutlookOAuthService = class OutlookOAuthService {
    prisma;
    authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAuthUrl(tenantId) {
        const clientId = process.env.OUTLOOK_CLIENT_ID;
        const redirectUri = process.env.OUTLOOK_REDIRECT_URI;
        if (!clientId || !redirectUri) {
            throw new Error('Outlook OAuth credentials not configured');
        }
        const state = (0, oauth_util_1.generateState)(tenantId);
        return (0, oauth_util_1.buildAuthUrl)(this.authUrl, {
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'Calendars.ReadWrite offline_access',
            state,
        });
    }
    async exchangeCode(tenantId, code) {
        const clientId = process.env.OUTLOOK_CLIENT_ID;
        const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;
        const redirectUri = process.env.OUTLOOK_REDIRECT_URI;
        if (!clientId || !clientSecret || !redirectUri) {
            throw new Error('Outlook OAuth credentials not configured');
        }
        try {
            const response = await axios_1.default.post(this.tokenUrl, new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code,
            }));
            const { access_token, refresh_token, expires_in } = response.data;
            const tokenSet = {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: (0, oauth_util_1.computeExpiry)(expires_in),
            };
            const encryptedTokens = (0, crypto_util_1.encryptObject)(tokenSet);
            await this.prisma.integration.upsert({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'outlook_calendar',
                    },
                },
                create: {
                    tenantId,
                    provider: 'outlook_calendar',
                    tokens: encryptedTokens,
                    status: 'connected',
                },
                update: {
                    tokens: encryptedTokens,
                    status: 'connected',
                    lastError: null,
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to exchange code: ${error.message}`);
        }
    }
    async refreshTokens(tenantId) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider: 'outlook_calendar',
                },
            },
        });
        if (!integration || !integration.tokens) {
            throw new Error('No Outlook Calendar integration found');
        }
        const tokenSet = (0, crypto_util_1.decryptObject)(integration.tokens);
        if (!tokenSet.refreshToken) {
            throw new Error('No refresh token available');
        }
        try {
            const clientId = process.env.OUTLOOK_CLIENT_ID;
            const clientSecret = process.env.OUTLOOK_CLIENT_SECRET;
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('refresh_token', tokenSet.refreshToken);
            const response = await axios_1.default.post(this.tokenUrl, params);
            const { access_token, expires_in } = response.data;
            const newTokenSet = {
                accessToken: access_token,
                refreshToken: tokenSet.refreshToken,
                expiresAt: (0, oauth_util_1.computeExpiry)(expires_in),
            };
            const encryptedTokens = (0, crypto_util_1.encryptObject)(newTokenSet);
            await this.prisma.integration.update({
                where: {
                    tenantId_provider: {
                        tenantId,
                        provider: 'outlook_calendar',
                    },
                },
                data: {
                    tokens: encryptedTokens,
                },
            });
            return newTokenSet;
        }
        catch (error) {
            throw new Error(`Failed to refresh tokens: ${error.message}`);
        }
    }
    async getValidToken(tenantId) {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: {
                    tenantId,
                    provider: 'outlook_calendar',
                },
            },
        });
        if (!integration || !integration.tokens) {
            throw new Error('No Outlook Calendar integration found');
        }
        const tokenSet = (0, crypto_util_1.decryptObject)(integration.tokens);
        if (tokenSet.expiresAt && Date.now() >= tokenSet.expiresAt - 5 * 60 * 1000) {
            const refreshed = await this.refreshTokens(tenantId);
            return refreshed.accessToken;
        }
        return tokenSet.accessToken;
    }
};
exports.OutlookOAuthService = OutlookOAuthService;
exports.OutlookOAuthService = OutlookOAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutlookOAuthService);
//# sourceMappingURL=outlook.oauth.js.map