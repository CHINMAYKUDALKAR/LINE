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
const swagger_1 = require("@nestjs/swagger");
const interviews_service_1 = require("./interviews.service");
const create_interview_dto_1 = require("./dto/create-interview.dto");
const reschedule_interview_dto_1 = require("./dto/reschedule-interview.dto");
const list_interviews_dto_1 = require("./dto/list-interviews.dto");
const bulk_schedule_dto_1 = require("./dto/bulk-schedule.dto");
const interview_note_dto_1 = require("./dto/interview-note.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const rate_limit_1 = require("../../common/rate-limit");
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
    listNotes(req, id) {
        return this.svc.listNotes(req.user.tenantId, id);
    }
    addNote(req, id, dto) {
        return this.svc.addNote(req.user.tenantId, id, req.user.sub, dto.content);
    }
    updateNote(req, noteId, dto) {
        return this.svc.updateNote(req.user.tenantId, noteId, req.user.sub, req.user.role, dto.content);
    }
    deleteNote(req, noteId) {
        return this.svc.deleteNote(req.user.tenantId, noteId, req.user.sub, req.user.role);
    }
    getTimeline(req, id) {
        return this.svc.getTimeline(req.user.tenantId, id);
    }
};
exports.InterviewsController = InterviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a new interview' }),
    (0, swagger_1.ApiBody)({ type: create_interview_dto_1.CreateInterviewDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Interview scheduled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Scheduling conflict detected' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_interview_dto_1.CreateInterviewDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk-schedule'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.BULK),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule multiple interviews at once' }),
    (0, swagger_1.ApiBody)({ type: bulk_schedule_dto_1.BulkScheduleDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Interviews scheduled successfully', schema: { example: { scheduled: 5, failed: 0, errors: [] } } }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, bulk_schedule_dto_1.BulkScheduleDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "bulkSchedule", null);
__decorate([
    (0, common_1.Post)('reschedule/:id'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule an existing interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID to reschedule' }),
    (0, swagger_1.ApiBody)({ type: reschedule_interview_dto_1.RescheduleInterviewDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview rescheduled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Scheduling conflict detected' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "createReschedule", null);
__decorate([
    (0, common_1.Get)(),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all interviews with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of interviews', schema: { example: { data: [], total: 0, page: 1, limit: 20 } } }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_interviews_dto_1.ListInterviewsDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interview details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview details with candidate and interviewer info' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a scheduled interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID to cancel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Interview already completed or cancelled' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/sync-calendar'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync interview with external calendar (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calendar sync triggered' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark an interview as completed' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interview marked as completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Interview already completed or cancelled' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "complete", null);
__decorate([
    (0, common_1.Get)(':id/notes'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all notes for an interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of notes with author details' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "listNotes", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a note to an interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiBody)({ type: interview_note_dto_1.CreateInterviewNoteDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Note created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, interview_note_dto_1.CreateInterviewNoteDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "addNote", null);
__decorate([
    (0, common_1.Patch)(':id/notes/:noteId'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an interview note (author or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiParam)({ name: 'noteId', description: 'Note ID' }),
    (0, swagger_1.ApiBody)({ type: interview_note_dto_1.UpdateInterviewNoteDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, interview_note_dto_1.UpdateInterviewNoteDto]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Delete)(':id/notes/:noteId'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an interview note (author or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiParam)({ name: 'noteId', description: 'Note ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note deleted' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('noteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "deleteNote", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interview timeline (notes, feedback, activity)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Timeline with notes, feedback, and activity' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InterviewsController.prototype, "getTimeline", null);
exports.InterviewsController = InterviewsController = __decorate([
    (0, swagger_1.ApiTags)('interviews'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/interviews'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [interviews_service_1.InterviewsService])
], InterviewsController);
//# sourceMappingURL=interviews.controller.js.map