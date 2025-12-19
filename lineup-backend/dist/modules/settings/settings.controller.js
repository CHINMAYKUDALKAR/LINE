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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const update_branding_dto_1 = require("./dto/update-branding.dto");
const update_sso_dto_1 = require("./dto/update-sso.dto");
const update_smtp_dto_1 = require("./dto/update-smtp.dto");
const test_smtp_dto_1 = require("./dto/test-smtp.dto");
const create_apikey_dto_1 = require("./dto/create-apikey.dto");
const revoke_apikey_dto_1 = require("./dto/revoke-apikey.dto");
const update_security_dto_1 = require("./dto/update-security.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let SettingsController = class SettingsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    getSettings(req) {
        return this.svc.getSettings(req.user.tenantId);
    }
    updateBranding(req, dto) {
        return this.svc.updateBranding(req.user.tenantId, req.user.sub, dto);
    }
    updateSso(req, dto) {
        return this.svc.updateSso(req.user.tenantId, req.user.sub, dto);
    }
    updateSmtp(req, dto) {
        return this.svc.updateSmtp(req.user.tenantId, req.user.sub, dto);
    }
    testSmtp(req, dto) {
        return this.svc.testSmtp(req.user.tenantId, dto);
    }
    createApiKey(req, dto) {
        return this.svc.createApiKey(req.user.tenantId, req.user.sub, dto);
    }
    listApiKeys(req) {
        return this.svc.listApiKeys(req.user.tenantId);
    }
    revokeApiKey(req, dto) {
        return this.svc.revokeApiKey(req.user.tenantId, req.user.sub, dto.id);
    }
    getSecurityPolicy(req) {
        return this.svc.getSecurityPolicy(req.user.tenantId);
    }
    updateSecurityPolicy(req, dto) {
        return this.svc.updateSecurityPolicy(req.user.tenantId, req.user.sub, dto);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tenant settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant settings including branding, SSO, SMTP configuration' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('branding'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant branding (logo, colors, name)' }),
    (0, swagger_1.ApiBody)({ type: update_branding_dto_1.UpdateBrandingDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Branding updated successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_branding_dto_1.UpdateBrandingDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateBranding", null);
__decorate([
    (0, common_1.Patch)('sso'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update SSO/SAML configuration' }),
    (0, swagger_1.ApiBody)({ type: update_sso_dto_1.UpdateSsoDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SSO configuration updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_sso_dto_1.UpdateSsoDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateSso", null);
__decorate([
    (0, common_1.Patch)('smtp'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update SMTP/email configuration' }),
    (0, swagger_1.ApiBody)({ type: update_smtp_dto_1.UpdateSmtpDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMTP configuration updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_smtp_dto_1.UpdateSmtpDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateSmtp", null);
__decorate([
    (0, common_1.Post)('smtp/test'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Test SMTP configuration by sending a test email' }),
    (0, swagger_1.ApiBody)({ type: test_smtp_dto_1.TestSmtpDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test email sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'SMTP configuration invalid or email failed' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, test_smtp_dto_1.TestSmtpDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "testSmtp", null);
__decorate([
    (0, common_1.Post)('apikeys'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new API key' }),
    (0, swagger_1.ApiBody)({ type: create_apikey_dto_1.CreateApiKeyDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'API key created', schema: { example: { id: '...', key: 'sk_live_...', name: 'Production' } } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_apikey_dto_1.CreateApiKeyDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Get)('apikeys'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'List all API keys for tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of API keys (keys are masked)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "listApiKeys", null);
__decorate([
    (0, common_1.Post)('apikeys/revoke'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an API key' }),
    (0, swagger_1.ApiBody)({ type: revoke_apikey_dto_1.RevokeApiKeyDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API key revoked' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'API key not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, revoke_apikey_dto_1.RevokeApiKeyDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Get)('security'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get security policy settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security policy including password rules, MFA settings' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSecurityPolicy", null);
__decorate([
    (0, common_1.Patch)('security'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Update security policy' }),
    (0, swagger_1.ApiBody)({ type: update_security_dto_1.UpdateSecurityPolicyDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security policy updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_security_dto_1.UpdateSecurityPolicyDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateSecurityPolicy", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/settings'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map