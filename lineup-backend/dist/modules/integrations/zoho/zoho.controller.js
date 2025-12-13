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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../../common/auth.guard");
const rbac_guard_1 = require("../../../common/rbac.guard");
const roles_decorator_1 = require("../../../common/roles.decorator");
const zoho_oauth_service_1 = require("./zoho.oauth.service");
const zoho_sync_service_1 = require("./zoho.sync.service");
const zoho_fieldmap_service_1 = require("./zoho.fieldmap.service");
const zoho_webhook_service_1 = require("./zoho.webhook.service");
const zoho_auth_dto_1 = require("./dto/zoho-auth.dto");
const zoho_fieldmap_dto_1 = require("./dto/zoho-fieldmap.dto");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
let ZohoController = class ZohoController {
    oauth;
    sync;
    fieldmap;
    webhook;
    syncQueue = new bullmq_1.Queue('zoho-sync', { connection: new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379') });
    constructor(oauth, sync, fieldmap, webhook) {
        this.oauth = oauth;
        this.sync = sync;
        this.fieldmap = fieldmap;
        this.webhook = webhook;
    }
    getAuthUrl(req, redirectUri) {
        return this.oauth.getAuthUrl(req.tenantId, redirectUri);
    }
    exchangeCode(req, dto) {
        return this.oauth.exchangeCode(req.tenantId, dto.code, dto.redirectUri);
    }
    requestSync(req, module) {
        return this.syncQueue.add('sync-now', { tenantId: req.tenantId, module });
    }
    saveFieldMap(req, dto) {
        return this.fieldmap.saveMapping(req.tenantId, dto.module, dto.mapping);
    }
    zohoWebhook(tenantId, body) {
        return this.webhook.handleWebhook(tenantId, body);
    }
};
exports.ZohoController = ZohoController;
__decorate([
    (0, common_1.Get)('auth-url'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('redirectUri')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ZohoController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Post)('exchange'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, zoho_auth_dto_1.ZohoAuthDto]),
    __metadata("design:returntype", void 0)
], ZohoController.prototype, "exchangeCode", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ZohoController.prototype, "requestSync", null);
__decorate([
    (0, common_1.Post)('fieldmap'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, zoho_fieldmap_dto_1.ZohoFieldMapDto]),
    __metadata("design:returntype", void 0)
], ZohoController.prototype, "saveFieldMap", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ZohoController.prototype, "zohoWebhook", null);
exports.ZohoController = ZohoController = __decorate([
    (0, common_1.Controller)('api/v1/integrations/zoho'),
    __metadata("design:paramtypes", [zoho_oauth_service_1.ZohoOAuthService,
        zoho_sync_service_1.ZohoSyncService,
        zoho_fieldmap_service_1.ZohoFieldMapService,
        zoho_webhook_service_1.ZohoWebhookService])
], ZohoController);
//# sourceMappingURL=zoho.controller.js.map