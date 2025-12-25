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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const update_tenant_dto_1 = require("./dto/update-tenant.dto");
const generate_domain_token_dto_1 = require("./dto/generate-domain-token.dto");
const verify_domain_dto_1 = require("./dto/verify-domain.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let TenantsController = class TenantsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(req, dto) {
        return this.svc.create(dto, req.user.sub);
    }
    findAll() {
        return this.svc.findAll();
    }
    findOne(req, id) {
        if (req.user.role !== 'SUPERADMIN' && req.user.tenantId !== id) {
            throw new common_1.ForbiddenException('Cannot access tenant you do not belong to');
        }
        return this.svc.findOne(id);
    }
    update(req, id, dto) {
        return this.svc.update(id, dto, req.user.sub);
    }
    generateDomainToken(id, dto) {
        return this.svc.generateDomainVerificationToken(id, dto.domain);
    }
    verifyDomain(id, dto) {
        return this.svc.verifyDomain(id, dto.token);
    }
    getMyTenants(req) {
        return this.svc.getTenantsForUser(req.user.sub);
    }
    getBranding(id) {
        return this.svc.getBranding(id);
    }
    updateBranding(req, id, dto) {
        if (req.user.role !== 'SUPERADMIN' && req.user.tenantId !== id) {
            throw new common_1.ForbiddenException('Cannot update branding for a different tenant');
        }
        return this.svc.updateBranding(id, req.user.sub, dto);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('SUPERADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('SUPERADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('SUPERADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/domain/generate'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_domain_token_dto_1.GenerateDomainTokenDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "generateDomainToken", null);
__decorate([
    (0, common_1.Post)(':id/domain/verify'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, verify_domain_dto_1.VerifyDomainDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "verifyDomain", null);
__decorate([
    (0, common_1.Get)('my-tenants'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getMyTenants", null);
__decorate([
    (0, common_1.Get)(':id/branding'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getBranding", null);
__decorate([
    (0, common_1.Patch)(':id/branding'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateBranding", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)('api/v1/tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map