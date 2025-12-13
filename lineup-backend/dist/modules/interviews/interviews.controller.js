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
exports.InterviewsController = void 0;
const common_1 = require("@nestjs/common");
const interviews_service_1 = require("./interviews.service");
const create_interview_dto_1 = require("./dto/create-interview.dto");
const list_interviews_dto_1 = require("./dto/list-interviews.dto");
const bulk_schedule_dto_1 = require("./dto/bulk-schedule.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let InterviewsController = class InterviewsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(req, dto) {
        return this.svc.create(req.user.tenantId, req.user.sub, dto);
    }
    bulkSchedule(req, dto) {
        return this.svc.bulkSchedule(req.user.tenantId, req.user.sub, dto);
    }
    createReschedule(req, dto) {
        return this.svc.reschedule(req.user.tenantId, req.user.sub, dto.interviewId, dto);
    }
    list(req, dto) {
        return this.svc.list(req.user.tenantId, dto);
    }
    get(req, id) {
        return this.svc.get(req.user.tenantId, id);
    }
    async cancel(req, id) {
        return this.svc.cancel(req.user.tenantId, req.user.sub, id);
    }
    sync(req, id) {
        return { message: 'Sync triggered' };
    }
    complete(req, id) {
        return this.svc.complete(req.user.tenantId, req.user.sub, id);
    }
};
exports.InterviewsController = InterviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_interview_dto_1.CreateInterviewDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk-schedule'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_schedule_dto_1.BulkScheduleDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "bulkSchedule", null);
__decorate([
    (0, common_1.Post)('reschedule/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "createReschedule", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_interviews_dto_1.ListInterviewsDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/sync-calendar'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "complete", null);
exports.InterviewsController = InterviewsController = __decorate([
    (0, common_1.Controller)('api/v1/interviews'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [interviews_service_1.InterviewsService])
], InterviewsController);
//# sourceMappingURL=interviews.controller.js.map