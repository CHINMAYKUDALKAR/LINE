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
exports.AdminConsoleController = void 0;
const common_1 = require("@nestjs/common");
const admin_console_service_1 = require("./admin-console.service");
const platform_rbac_guard_1 = require("./guards/platform-rbac.guard");
const auth_guard_1 = require("../../common/auth.guard");
const create_platform_user_dto_1 = require("./dto/create-platform-user.dto");
const create_tenant_provision_dto_1 = require("./dto/create-tenant-provision.dto");
const roles_decorator_1 = require("../../common/roles.decorator");
let AdminConsoleController = class AdminConsoleController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    createPlatformUser(req, dto) {
        return this.svc.createPlatformUser(dto, req.user.sub);
    }
    provisionTenant(req, dto) {
        return this.svc.provisionTenant(dto, req.user.sub);
    }
    listTenants() {
        return this.svc.listTenants();
    }
    tenantStatus(id) {
        return this.svc.tenantStatus(id);
    }
    createTenantAdmin(id, email) {
        return this.svc.createTenantAdmin(id, email);
    }
};
exports.AdminConsoleController = AdminConsoleController;
__decorate([
    (0, common_1.Post)('platform-users'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_platform_user_dto_1.CreatePlatformUserDto]),
    __metadata("design:returntype", void 0)
], AdminConsoleController.prototype, "createPlatformUser", null);
__decorate([
    (0, common_1.Post)('provision-tenant'),
    (0, roles_decorator_1.Roles)('SUPERADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tenant_provision_dto_1.CreateTenantProvisionDto]),
    __metadata("design:returntype", void 0)
], AdminConsoleController.prototype, "provisionTenant", null);
__decorate([
    (0, common_1.Get)('tenants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminConsoleController.prototype, "listTenants", null);
__decorate([
    (0, common_1.Get)('tenants/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminConsoleController.prototype, "tenantStatus", null);
__decorate([
    (0, common_1.Post)('tenants/:id/create-admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminConsoleController.prototype, "createTenantAdmin", null);
exports.AdminConsoleController = AdminConsoleController = __decorate([
    (0, common_1.Controller)('api/v1/admin'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, platform_rbac_guard_1.PlatformRbacGuard),
    __metadata("design:paramtypes", [admin_console_service_1.AdminConsoleService])
], AdminConsoleController);
//# sourceMappingURL=admin-console.controller.js.map