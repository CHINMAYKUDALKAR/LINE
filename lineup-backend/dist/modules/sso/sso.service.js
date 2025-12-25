"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSOService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const identity_provider_service_1 = require("../identity-provider/identity-provider.service");
const mock_saml_provider_1 = require("./providers/mock-saml.provider");
const mock_google_provider_1 = require("./providers/mock-google.provider");
const mock_microsoft_provider_1 = require("./providers/mock-microsoft.provider");
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const PLATFORM_ADMIN_ROLES = ['SUPERADMIN', 'SUPPORT'];
let SSOService = class SSOService {
    prisma;
    identityProviderService;
    constructor(prisma, identityProviderService) {
        this.prisma = prisma;
        this.identityProviderService = identityProviderService;
    }
    async initiate(tenantId, callerRole, dto) {
        if (callerRole && PLATFORM_ADMIN_ROLES.includes(callerRole.toUpperCase())) {
            throw new common_1.ForbiddenException('Platform administrators must use platform login, not tenant SSO');
        }
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const provider = dto.provider
            ? await this.identityProviderService.findByType(tenantId, dto.provider)
            : await this.identityProviderService.findEnabledProvider(tenantId);
        if (!provider) {
            throw new common_1.BadRequestException('No SSO provider configured for this tenant');
        }
        if (!provider.enabled) {
            throw new common_1.BadRequestException('SSO provider is not enabled');
        }
        let redirectUrl;
        switch (provider.providerType) {
            case 'SAML':
                redirectUrl = mock_saml_provider_1.MockSAMLProvider.generateAuthRequest({
                    samlSsoUrl: provider.samlSsoUrl || undefined,
                    samlEntityId: provider.samlEntityId || undefined,
                    samlAcsUrl: provider.samlAcsUrl || undefined
                });
                break;
            case 'GOOGLE':
                redirectUrl = mock_google_provider_1.MockGoogleProvider.generateAuthUrl({
                    clientId: provider.clientId || undefined,
                    redirectUri: provider.redirectUri || undefined,
                    state: `tenant:${tenantId}`
                });
                break;
            case 'MICROSOFT':
                redirectUrl = mock_microsoft_provider_1.MockMicrosoftProvider.generateAuthUrl({
                    clientId: provider.clientId || undefined,
                    redirectUri: provider.redirectUri || undefined,
                    state: `tenant:${tenantId}`
                });
                break;
            default:
                throw new common_1.BadRequestException('Unknown provider type');
        }
        return {
            redirectUrl,
            provider: provider.providerType,
            tenant: tenantId,
            mock: true
        };
    }
    async callback(tenantId, dto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const providerType = dto.SAMLResponse ? 'SAML' : (dto.provider || 'GOOGLE');
        const provider = await this.identityProviderService.findByType(tenantId, providerType);
        if (!provider || !provider.enabled) {
            throw new common_1.BadRequestException('SSO provider not found or disabled');
        }
        let claims;
        switch (provider.providerType) {
            case 'SAML':
                const samlClaims = mock_saml_provider_1.MockSAMLProvider.parseSAMLResponse(dto.SAMLResponse || dto.code);
                claims = {
                    email: samlClaims.email,
                    firstName: samlClaims.firstName,
                    lastName: samlClaims.lastName
                };
                break;
            case 'GOOGLE':
                const googleTokens = await mock_google_provider_1.MockGoogleProvider.exchangeCodeForToken(dto.code, {
                    clientId: provider.clientId || undefined,
                    clientSecret: provider.clientSecret || undefined,
                    redirectUri: provider.redirectUri || undefined
                });
                const googleUser = await mock_google_provider_1.MockGoogleProvider.fetchUserInfo(googleTokens.access_token);
                claims = {
                    email: googleUser.email,
                    name: googleUser.name
                };
                break;
            case 'MICROSOFT':
                const msTokens = await mock_microsoft_provider_1.MockMicrosoftProvider.exchangeCodeForToken(dto.code, {
                    clientId: provider.clientId || undefined,
                    clientSecret: provider.clientSecret || undefined,
                    redirectUri: provider.redirectUri || undefined
                });
                const msUser = await mock_microsoft_provider_1.MockMicrosoftProvider.fetchUserInfo(msTokens.access_token);
                claims = {
                    email: msUser.email,
                    name: msUser.displayName
                };
                break;
            default:
                throw new common_1.BadRequestException('Unknown provider type');
        }
        if (provider.domainRestriction) {
            const emailDomain = claims.email.split('@')[1];
            if (emailDomain !== provider.domainRestriction) {
                throw new common_1.ForbiddenException(`Email domain must be ${provider.domainRestriction}`);
            }
        }
        let user = await this.prisma.user.findUnique({
            where: { email: claims.email }
        });
        if (user && PLATFORM_ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Platform administrators cannot use tenant SSO');
        }
        if (!user) {
            if (provider.autoProvision) {
                const name = claims.name || `${claims.firstName || ''} ${claims.lastName || ''}`.trim() || claims.email.split('@')[0];
                user = await this.prisma.user.create({
                    data: {
                        email: claims.email,
                        password: crypto.randomBytes(32).toString('hex'),
                        name,
                        tenantId,
                        role: process.env.SSO_DEFAULT_ROLE || 'RECRUITER',
                        emailVerified: true
                    }
                });
                await this.prisma.userTenant.create({
                    data: {
                        userId: user.id,
                        tenantId,
                        role: 'RECRUITER'
                    }
                });
                await this.prisma.auditLog.create({
                    data: {
                        tenantId,
                        userId: user.id,
                        action: 'SSO_AUTO_PROVISION',
                        metadata: { email: claims.email, provider: provider.providerType }
                    }
                });
            }
            else {
                throw new common_1.UnauthorizedException('User not found and auto-provisioning is disabled');
            }
        }
        const userTenant = await this.prisma.userTenant.findUnique({
            where: { userId_tenantId: { userId: user.id, tenantId } }
        });
        const accessToken = jwt.sign({
            sub: user.id,
            email: user.email,
            tenantId,
            role: userTenant?.role || user.role
        }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '1h') });
        const refreshToken = jwt.sign({ sub: user.id, tenantId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId: user.id,
                action: 'SSO_LOGIN',
                metadata: { provider: provider.providerType, email: claims.email }
            }
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: userTenant?.role || user.role
            },
            tenant: {
                id: tenant.id,
                name: tenant.name
            }
        };
    }
    async getAvailableProviders(tenantId) {
        const providers = await this.prisma.identityProvider.findMany({
            where: { tenantId, enabled: true },
            select: {
                id: true,
                providerType: true,
                domainRestriction: true
            }
        });
        return providers.map(p => ({
            type: p.providerType,
            domainRestriction: p.domainRestriction
        }));
    }
};
exports.SSOService = SSOService;
exports.SSOService = SSOService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        identity_provider_service_1.IdentityProviderService])
], SSOService);
//# sourceMappingURL=sso.service.js.map