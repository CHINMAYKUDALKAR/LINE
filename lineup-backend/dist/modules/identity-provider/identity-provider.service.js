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
exports.IdentityProviderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const SUPERADMIN_ROLES = ['SUPERADMIN', 'SUPPORT'];
const ADMIN_ROLES = ['ADMIN', ...SUPERADMIN_ROLES];
let IdentityProviderService = class IdentityProviderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.identityProvider.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(tenantId, id) {
        const provider = await this.prisma.identityProvider.findUnique({
            where: { id }
        });
        if (!provider || provider.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Identity provider not found');
        }
        return provider;
    }
    async findByType(tenantId, providerType) {
        return this.prisma.identityProvider.findUnique({
            where: {
                tenantId_providerType: {
                    tenantId,
                    providerType: providerType
                }
            }
        });
    }
    async findEnabledProvider(tenantId, providerType) {
        const where = { tenantId, enabled: true };
        if (providerType)
            where.providerType = providerType;
        return this.prisma.identityProvider.findFirst({ where });
    }
    async create(tenantId, userId, userRole, dto) {
        if (!ADMIN_ROLES.includes(userRole)) {
            throw new common_1.ForbiddenException('Only administrators can configure SSO');
        }
        const existing = await this.findByType(tenantId, dto.providerType);
        if (existing) {
            throw new common_1.ForbiddenException(`Provider ${dto.providerType} already configured for this tenant`);
        }
        return this.prisma.identityProvider.create({
            data: {
                tenantId,
                providerType: dto.providerType,
                clientId: dto.clientId,
                clientSecret: dto.clientSecret,
                redirectUri: dto.redirectUri,
                domainRestriction: dto.domainRestriction,
                samlMetadataUrl: dto.samlMetadataUrl,
                samlEntityId: dto.samlEntityId,
                samlCertificate: dto.samlCertificate,
                samlAcsUrl: dto.samlAcsUrl,
                samlSsoUrl: dto.samlSsoUrl,
                samlLogoutUrl: dto.samlLogoutUrl,
                autoProvision: dto.autoProvision ?? false,
                enabled: dto.enabled ?? false,
                createdById: userId
            }
        });
    }
    async update(tenantId, userId, userRole, id, dto) {
        if (!ADMIN_ROLES.includes(userRole)) {
            throw new common_1.ForbiddenException('Only administrators can modify SSO configuration');
        }
        await this.findOne(tenantId, id);
        return this.prisma.identityProvider.update({
            where: { id },
            data: {
                ...dto,
                updatedById: userId
            }
        });
    }
    async delete(tenantId, userRole, id) {
        if (!ADMIN_ROLES.includes(userRole)) {
            throw new common_1.ForbiddenException('Only administrators can remove SSO configuration');
        }
        await this.findOne(tenantId, id);
        await this.prisma.identityProvider.delete({ where: { id } });
        return { success: true, message: 'Provider deleted' };
    }
    async toggleEnabled(tenantId, userId, userRole, id, enabled) {
        if (!ADMIN_ROLES.includes(userRole)) {
            throw new common_1.ForbiddenException('Only administrators can toggle SSO');
        }
        await this.findOne(tenantId, id);
        return this.prisma.identityProvider.update({
            where: { id },
            data: { enabled, updatedById: userId }
        });
    }
};
exports.IdentityProviderService = IdentityProviderService;
exports.IdentityProviderService = IdentityProviderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IdentityProviderService);
//# sourceMappingURL=identity-provider.service.js.map