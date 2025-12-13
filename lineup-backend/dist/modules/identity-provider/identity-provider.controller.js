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
exports.IdentityProviderController = void 0;
const common_1 = require("@nestjs/common");
const identity_provider_service_1 = require("./identity-provider.service");
const create_identity_provider_dto_1 = require("./dto/create-identity-provider.dto");
const update_identity_provider_dto_1 = require("./dto/update-identity-provider.dto");
const auth_guard_1 = require("../../common/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let IdentityProviderController = class IdentityProviderController {
    identityProviderService;
    constructor(identityProviderService) {
        this.identityProviderService = identityProviderService;
    }
    findAll(req) {
        return this.identityProviderService.findAll(req.user.tenantId);
    }
    findOne(req, id) {
        return this.identityProviderService.findOne(req.user.tenantId, id);
    }
    create(req, dto) {
        return this.identityProviderService.create(req.user.tenantId, req.user.sub, req.user.role, dto);
    }
    update(req, id, dto) {
        return this.identityProviderService.update(req.user.tenantId, req.user.sub, req.user.role, id, dto);
    }
    delete(req, id) {
        return this.identityProviderService.delete(req.user.tenantId, req.user.role, id);
    }
    toggle(req, id, body) {
        return this.identityProviderService.toggleEnabled(req.user.tenantId, req.user.sub, req.user.role, id, body.enabled);
    }
};
exports.IdentityProviderController = IdentityProviderController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all SSO providers for tenant' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IdentityProviderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get SSO provider details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IdentityProviderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create SSO provider configuration (Admin only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_identity_provider_dto_1.CreateIdentityProviderDto]),
    __metadata("design:returntype", void 0)
], IdentityProviderController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update SSO provider configuration (Admin only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_identity_provider_dto_1.UpdateIdentityProviderDto]),
    __metadata("design:returntype", void 0)
], IdentityProviderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete SSO provider (Admin only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IdentityProviderController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable/Disable SSO provider (Admin only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], IdentityProviderController.prototype, "toggle", null);
exports.IdentityProviderController = IdentityProviderController = __decorate([
    (0, swagger_1.ApiTags)('Identity Providers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('api/v1/identity-providers'),
    __metadata("design:paramtypes", [identity_provider_service_1.IdentityProviderService])
], IdentityProviderController);
//# sourceMappingURL=identity-provider.controller.js.map