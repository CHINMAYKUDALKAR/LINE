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
exports.RecycleBinController = void 0;
const common_1 = require("@nestjs/common");
const recycle_bin_service_1 = require("./recycle-bin.service");
const auth_guard_1 = require("../../common/auth.guard");
const list_recycle_bin_dto_1 = require("./dto/list-recycle-bin.dto");
const swagger_1 = require("@nestjs/swagger");
let RecycleBinController = class RecycleBinController {
    recycleBinService;
    constructor(recycleBinService) {
        this.recycleBinService = recycleBinService;
    }
    list(req, dto) {
        return this.recycleBinService.findAll(req.user.tenantId, req.user.sub, req.user.role, dto);
    }
    getStats(req) {
        return this.recycleBinService.getStats(req.user.tenantId, req.user.sub, req.user.role);
    }
    findOne(req, id) {
        return this.recycleBinService.findOne(req.user.tenantId, req.user.sub, req.user.role, id);
    }
    restore(req, id) {
        return this.recycleBinService.restore(req.user.tenantId, req.user.sub, req.user.role, id);
    }
    purge(req, id) {
        return this.recycleBinService.purge(req.user.tenantId, req.user.sub, req.user.role, id);
    }
};
exports.RecycleBinController = RecycleBinController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List deleted items (role-based filtering)' }),
    (0, swagger_1.ApiQuery)({ name: 'module', required: false, description: 'Filter by module type' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Filter from date' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Filter to date' }),
    (0, swagger_1.ApiQuery)({ name: 'deletedBy', required: false, description: 'Filter by user (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'perPage', required: false, description: 'Items per page' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_recycle_bin_dto_1.ListRecycleBinDto]),
    __metadata("design:returntype", void 0)
], RecycleBinController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recycle bin statistics by module' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecycleBinController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deleted item details (role-based access)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecycleBinController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a deleted item (owner or admin)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecycleBinController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete an item (admin only)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecycleBinController.prototype, "purge", null);
exports.RecycleBinController = RecycleBinController = __decorate([
    (0, swagger_1.ApiTags)('Recycle Bin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('api/v1/recycle-bin'),
    __metadata("design:paramtypes", [recycle_bin_service_1.RecycleBinService])
], RecycleBinController);
//# sourceMappingURL=recycle-bin.controller.js.map