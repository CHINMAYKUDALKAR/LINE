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
exports.FeedbackController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feedback_service_1 = require("./feedback.service");
const submit_feedback_dto_1 = require("./dto/submit-feedback.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let FeedbackController = class FeedbackController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    submit(req, dto) {
        return this.svc.submitFeedback(req.user.tenantId, req.user.sub, dto);
    }
    getForInterview(req, id) {
        return this.svc.getInterviewFeedback(req.user.tenantId, id);
    }
};
exports.FeedbackController = FeedbackController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('INTERVIEWER', 'RECRUITER', 'MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit interview feedback' }),
    (0, swagger_1.ApiBody)({ type: submit_feedback_dto_1.SubmitFeedbackDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Feedback submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid feedback data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_feedback_dto_1.SubmitFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('interview/:id'),
    (0, roles_decorator_1.Roles)('RECRUITER', 'MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all feedback for an interview' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Interview ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of feedback entries for the interview' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Interview not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FeedbackController.prototype, "getForInterview", null);
exports.FeedbackController = FeedbackController = __decorate([
    (0, swagger_1.ApiTags)('feedback'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/feedback'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [feedback_service_1.FeedbackService])
], FeedbackController);
//# sourceMappingURL=feedback.controller.js.map