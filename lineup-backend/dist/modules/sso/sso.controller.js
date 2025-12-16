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
exports.SSOController = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("./sso.service");
const initiate_sso_dto_1 = require("./dto/initiate-sso.dto");
const sso_callback_dto_1 = require("./dto/sso-callback.dto");
const swagger_1 = require("@nestjs/swagger");
const rate_limit_1 = require("../../common/rate-limit");
let SSOController = class SSOController {
    ssoService;
    constructor(ssoService) {
        this.ssoService = ssoService;
    }
    getProviders(tenantId) {
        return this.ssoService.getAvailableProviders(tenantId);
    }
    initiate(tenantId, dto) {
        return this.ssoService.initiate(tenantId, undefined, dto);
    }
    callback(tenantId, dto) {
        return this.ssoService.callback(tenantId, dto);
    }
};
exports.SSOController = SSOController;
__decorate([
    (0, common_1.Get)(':tenantId/providers'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get available SSO providers for a tenant (public)' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SSOController.prototype, "getProviders", null);
__decorate([
    (0, common_1.Post)(':tenantId/initiate'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate SSO flow (returns mock redirect URL)' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, initiate_sso_dto_1.InitiateSSODto]),
    __metadata("design:returntype", void 0)
], SSOController.prototype, "initiate", null);
__decorate([
    (0, common_1.Post)(':tenantId/callback'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.AUTH),
    (0, swagger_1.ApiOperation)({ summary: 'Handle SSO callback (mock implementation)' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sso_callback_dto_1.SSOCallbackDto]),
    __metadata("design:returntype", void 0)
], SSOController.prototype, "callback", null);
exports.SSOController = SSOController = __decorate([
    (0, swagger_1.ApiTags)('SSO'),
    (0, common_1.Controller)('auth/sso'),
    __metadata("design:paramtypes", [sso_service_1.SSOService])
], SSOController);
//# sourceMappingURL=sso.controller.js.map