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
exports.CandidatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const candidates_service_1 = require("./candidates.service");
const create_candidate_dto_1 = require("./dto/create-candidate.dto");
const update_candidate_dto_1 = require("./dto/update-candidate.dto");
const list_candidates_dto_1 = require("./dto/list-candidates.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let CandidatesController = class CandidatesController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    create(req, dto) {
        return this.svc.create(req.user.tenantId, req.user.sub, dto);
    }
    list(req, dto) {
        return this.svc.list(req.user.tenantId, dto);
    }
    get(req, id) {
        return this.svc.get(req.user.tenantId, id);
    }
    update(req, id, dto) {
        return this.svc.update(req.user.tenantId, req.user.sub, id, dto);
    }
    delete(req, id) {
        return this.svc.delete(req.user.tenantId, req.user.sub, id);
    }
    uploadUrl(req, id, filename) {
        return this.svc.generateResumeUploadUrl(req.user.tenantId, req.user.sub, id, filename);
    }
    attachResume(req, id, fileId, s3Key, mimeType, size) {
        return this.svc.attachResume(req.user.tenantId, req.user.sub, id, fileId, s3Key, mimeType, size);
    }
    bulkImport(req, body) {
        if (body.rows && Array.isArray(body.rows)) {
            return this.svc.directBulkImport(req.user.tenantId, req.user.sub, body.rows);
        }
        return this.svc.bulkImport(req.user.tenantId, req.user.sub, body);
    }
};
exports.CandidatesController = CandidatesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new candidate' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidate created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: create_candidate_dto_1.CreateCandidateDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_candidate_dto_1.CreateCandidateDto]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all candidates with pagination and filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of candidates' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_candidates_dto_1.ListCandidatesDto]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get candidate by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_candidate_dto_1.UpdateCandidateDto]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/resume/upload-url'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "uploadUrl", null);
__decorate([
    (0, common_1.Post)(':id/resume/attach'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('fileId')),
    __param(3, (0, common_1.Body)('s3Key')),
    __param(4, (0, common_1.Body)('mimeType')),
    __param(5, (0, common_1.Body)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "attachResume", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "bulkImport", null);
exports.CandidatesController = CandidatesController = __decorate([
    (0, swagger_1.ApiTags)('candidates'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/candidates'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [candidates_service_1.CandidatesService])
], CandidatesController);
//# sourceMappingURL=candidates.controller.js.map