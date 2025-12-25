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
var ZohoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoController = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const auth_guard_1 = require("../../../common/auth.guard");
const rbac_guard_1 = require("../../../common/rbac.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const zoho_oauth_service_1 = require("./zoho.oauth.service");
const zoho_sync_service_1 = require("./zoho.sync.service");
const zoho_fieldmap_service_1 = require("./zoho.fieldmap.service");
const zoho_webhook_service_1 = require("./zoho.webhook.service");
const zoho_auth_dto_1 = require("./dto/zoho-auth.dto");
const zoho_fieldmap_dto_1 = require("./dto/zoho-fieldmap.dto");
const prisma_service_1 = require("../../../common/prisma.service");
let ZohoController = ZohoController_1 = class ZohoController {
    oauth;
    sync;
    fieldmap;
    webhook;
    prisma;
    syncQueue;
    logger = new common_1.Logger(ZohoController_1.name);
    syncRateLimits = new Map();
    constructor(oauth, sync, fieldmap, webhook, prisma, syncQueue) {
        this.oauth = oauth;
        this.sync = sync;
        this.fieldmap = fieldmap;
        this.webhook = webhook;
        this.prisma = prisma;
        this.syncQueue = syncQueue;
    }
    getAuthUrl(req, redirectUri) {
        return this.oauth.getAuthUrl(req.tenantId, redirectUri);
    }
    exchangeCode(req, dto) {
        return this.oauth.exchangeCode(req.tenantId, dto.code, dto.redirectUri);
    }
    async requestSync(req, module) {
        const now = Date.now();
        const key = req.tenantId;
        const limit = this.syncRateLimits.get(key);
        if (limit && limit.resetAt > now) {
            if (limit.count >= 5) {
                throw new common_1.BadRequestException('Rate limit exceeded: max 5 syncs per hour');
            }
            limit.count++;
        }
        else {
            this.syncRateLimits.set(key, { count: 1, resetAt: now + 3600000 });
        }
        return this.syncQueue.add('sync-now', {
            tenantId: req.tenantId,
            module: module || 'all',
            type: module ? 'single' : 'full',
        });
    }
    saveFieldMap(req, dto) {
        return this.fieldmap.saveMapping(req.tenantId, dto.module, dto.mapping);
    }
    async zohoWebhook(tenantId, body) {
        if (!tenantId) {
            this.logger.warn('Webhook received without tenantId');
            throw new common_1.BadRequestException('Missing tenantId');
        }
        const integration = await this.prisma.integration.findFirst({
            where: {
                tenantId,
                provider: 'zoho',
                status: 'connected',
            },
        });
        if (!integration) {
            this.logger.warn(`Webhook received for unknown/inactive integration: ${tenantId}`);
            throw new common_1.BadRequestException('Invalid or inactive integration');
        }
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
    __metadata("design:returntype", Promise)
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
    __metadata("design:returntype", Promise)
], ZohoController.prototype, "zohoWebhook", null);
exports.ZohoController = ZohoController = ZohoController_1 = __decorate([
    (0, common_1.Controller)('api/v1/integrations/zoho'),
    __param(5, (0, bullmq_1.InjectQueue)('zoho-sync')),
    __metadata("design:paramtypes", [zoho_oauth_service_1.ZohoOAuthService,
        zoho_sync_service_1.ZohoSyncService,
        zoho_fieldmap_service_1.ZohoFieldMapService,
        zoho_webhook_service_1.ZohoWebhookService,
        prisma_service_1.PrismaService,
        bullmq_2.Queue])
], ZohoController);
//# sourceMappingURL=zoho.controller.js.map