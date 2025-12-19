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
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const integrations_service_1 = require("./integrations.service");
const connect_dto_1 = require("./dto/connect.dto");
const mapping_dto_1 = require("./dto/mapping.dto");
const sync_dto_1 = require("./dto/sync.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let IntegrationsController = class IntegrationsController {
    integrationsService;
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async listIntegrations(req) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.listIntegrations(tenantId);
    }
    async getIntegration(req, provider) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getIntegration(tenantId, provider);
    }
    async connect(req, connectDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.connect(tenantId, connectDto.provider, userId);
    }
    async callback(provider, code, state, req) {
        const userId = req.user?.id || 'system';
        return this.integrationsService.callback(provider, code, state, userId);
    }
    async updateMapping(req, mappingDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.updateMapping(tenantId, mappingDto.provider, mappingDto, userId);
    }
    async triggerSync(req, syncDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        const since = syncDto.since ? new Date(syncDto.since) : undefined;
        return this.integrationsService.syncNow(tenantId, syncDto.provider, userId, since);
    }
    async disconnect(req, body) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.disconnect(tenantId, body.provider, userId);
    }
    async getWebhooks(req, provider, limit) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getWebhookEvents(tenantId, provider, parseInt(limit || '50'));
    }
    async getMetrics(req, provider) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getMetrics(tenantId, provider);
    }
    async getFields(req, provider) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getFieldSchemas(tenantId, provider);
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'List all integrations for the tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of configured integrations with their status' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "listIntegrations", null);
__decorate([
    (0, common_1.Get)(':provider'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific integration details' }),
    (0, swagger_1.ApiParam)({ name: 'provider', description: 'Integration provider (e.g., zoho, google, outlook)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration details and configuration' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Post)('connect'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate OAuth connection flow for a provider' }),
    (0, swagger_1.ApiBody)({ type: connect_dto_1.ConnectDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authorization URL for OAuth flow', schema: { example: { authUrl: 'https://...' } } }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid provider' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, connect_dto_1.ConnectDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle OAuth callback from provider' }),
    (0, swagger_1.ApiQuery)({ name: 'provider', description: 'Integration provider' }),
    (0, swagger_1.ApiQuery)({ name: 'code', description: 'Authorization code from provider' }),
    (0, swagger_1.ApiQuery)({ name: 'state', description: 'State parameter for CSRF protection' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration connected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid code or state' }),
    __param(0, (0, common_1.Query)('provider')),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('state')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('mapping'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update field mapping configuration for an integration' }),
    (0, swagger_1.ApiBody)({ type: mapping_dto_1.UpdateMappingDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mapping updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mapping_dto_1.UpdateMappingDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateMapping", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger manual sync with external system' }),
    (0, swagger_1.ApiBody)({ type: sync_dto_1.TriggerSyncDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync triggered successfully', schema: { example: { synced: 25, errors: 0 } } }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not connected' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sync_dto_1.TriggerSyncDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "triggerSync", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect an integration' }),
    (0, swagger_1.ApiBody)({ schema: { example: { provider: 'zoho' } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Integration disconnected' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Integration not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Get)(':provider/webhooks'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhook events for an integration' }),
    (0, swagger_1.ApiParam)({ name: 'provider', description: 'Integration provider' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of events to return (default: 50)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of recent webhook events' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('provider')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getWebhooks", null);
__decorate([
    (0, common_1.Get)(':provider/metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get sync metrics and statistics for an integration' }),
    (0, swagger_1.ApiParam)({ name: 'provider', description: 'Integration provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync metrics including success rate, last sync time, etc.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(':provider/fields'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get field schemas for mapping configuration' }),
    (0, swagger_1.ApiParam)({ name: 'provider', description: 'Integration provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available fields from both Lineup and external system for mapping' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getFields", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('integrations'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/integrations'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map