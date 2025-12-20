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
exports.HiringStagesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../../auth/guards/jwt.guard");
const rbac_guard_1 = require("../../../common/rbac.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const hiring_stages_service_1 = require("../services/hiring-stages.service");
const hiring_stage_dto_1 = require("../dto/hiring-stage.dto");
let HiringStagesController = class HiringStagesController {
    stagesService;
    constructor(stagesService) {
        this.stagesService = stagesService;
    }
    async list(req, includeInactive) {
        return this.stagesService.list(req.user.tenantId, includeInactive === 'true');
    }
    async get(req, id) {
        return this.stagesService.get(req.user.tenantId, id);
    }
    async create(req, dto) {
        return this.stagesService.create(req.user.tenantId, req.user.userId, dto);
    }
    async update(req, id, dto) {
        return this.stagesService.update(req.user.tenantId, req.user.userId, id, dto);
    }
    async reorder(req, dto) {
        return this.stagesService.reorder(req.user.tenantId, req.user.userId, dto.stageIds);
    }
    async toggle(req, id) {
        return this.stagesService.toggle(req.user.tenantId, req.user.userId, id);
    }
    async delete(req, id) {
        return this.stagesService.delete(req.user.tenantId, req.user.userId, id);
    }
};
exports.HiringStagesController = HiringStagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, hiring_stage_dto_1.CreateHiringStageDto]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, hiring_stage_dto_1.UpdateHiringStageDto]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, hiring_stage_dto_1.ReorderHiringStagesDto]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "toggle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], HiringStagesController.prototype, "delete", null);
exports.HiringStagesController = HiringStagesController = __decorate([
    (0, common_1.Controller)('settings/stages'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [hiring_stages_service_1.HiringStagesService])
], HiringStagesController);
//# sourceMappingURL=hiring-stages.controller.js.map