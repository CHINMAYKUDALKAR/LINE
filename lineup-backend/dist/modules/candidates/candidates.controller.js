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
const candidate_note_dto_1 = require("./dto/candidate-note.dto");
const transition_stage_dto_1 = require("./dto/transition-stage.dto");
const resume_parser_dto_1 = require("./dto/resume-parser.dto");
const stage_transition_service_1 = require("./services/stage-transition.service");
const resume_parser_service_1 = require("./services/resume-parser.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const rate_limit_1 = require("../../common/rate-limit");
let CandidatesController = class CandidatesController {
    svc;
    stageTransitionService;
    resumeParserService;
    constructor(svc, stageTransitionService, resumeParserService) {
        this.svc = svc;
        this.stageTransitionService = stageTransitionService;
        this.resumeParserService = resumeParserService;
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
    async transitionStage(req, id, dto) {
        const allowOverride = req.user.role === 'ADMIN' ? dto.allowOverride : false;
        return this.stageTransitionService.transitionStage(req.user.tenantId, {
            candidateId: id,
            newStage: dto.newStage,
            source: 'USER',
            triggeredBy: 'MANUAL',
            actorId: req.user.sub,
            reason: dto.reason,
            allowOverride,
        });
    }
    async rejectCandidate(req, id, dto) {
        return this.stageTransitionService.rejectCandidate(req.user.tenantId, id, dto.reason, req.user.sub);
    }
    async getStageHistory(req, id) {
        return this.stageTransitionService.getStageHistory(req.user.tenantId, id);
    }
    uploadUrl(req, id, filename) {
        return this.svc.generateResumeUploadUrl(req.user.tenantId, req.user.sub, id, filename);
    }
    attachResume(req, id, fileId, s3Key, mimeType, size) {
        return this.svc.attachResume(req.user.tenantId, req.user.sub, id, fileId, s3Key, mimeType, size);
    }
    photoUploadUrl(req, id, filename) {
        return this.svc.generatePhotoUploadUrl(req.user.tenantId, req.user.sub, id, filename);
    }
    attachPhoto(req, id, fileId, s3Key) {
        return this.svc.attachPhoto(req.user.tenantId, req.user.sub, id, fileId, s3Key);
    }
    bulkImport(req, body) {
        if (body.rows && Array.isArray(body.rows)) {
            return this.svc.directBulkImport(req.user.tenantId, req.user.sub, body.rows);
        }
        return this.svc.bulkImport(req.user.tenantId, req.user.sub, body);
    }
    importFromFile(req, fileId) {
        return this.svc.importFromFile(req.user.tenantId, req.user.sub, fileId);
    }
    async parseResume(req, dto) {
        const result = await this.resumeParserService.parseResume(req.user.tenantId, dto.fileId);
        await this.svc.logResumeParseAction(req.user.tenantId, req.user.sub, dto.fileId, result.status);
        return result;
    }
    async parseResumesBulk(req, dto) {
        const result = await this.resumeParserService.parseResumes(req.user.tenantId, dto.fileIds);
        await this.svc.logBulkResumeParseAction(req.user.tenantId, req.user.sub, dto.fileIds, result.summary);
        return result;
    }
    async createFromResume(req, dto) {
        return this.svc.createFromResume(req.user.tenantId, req.user.sub, dto);
    }
    listDocuments(req, id) {
        return this.svc.listDocuments(req.user.tenantId, id);
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
};
exports.CandidatesController = CandidatesController;
__decorate([
    (0, common_1.Post)(),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
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
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
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
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
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
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
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
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Transition candidate to a new stage' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiBody)({ type: transition_stage_dto_1.TransitionStageDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stage transition successful', type: transition_stage_dto_1.StageTransitionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid stage or transition not allowed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Candidate is in terminal stage' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, transition_stage_dto_1.TransitionStageDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "transitionStage", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a candidate (moves to terminal REJECTED stage)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiBody)({ type: transition_stage_dto_1.RejectCandidateDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Candidate rejected successfully', type: transition_stage_dto_1.StageTransitionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Reason is required' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Candidate is already in terminal stage' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, transition_stage_dto_1.RejectCandidateDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "rejectCandidate", null);
__decorate([
    (0, common_1.Get)(':id/stage-history'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full stage transition history for a candidate' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stage transition history', type: [transition_stage_dto_1.StageHistoryEntryDto] }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidate not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "getStageHistory", null);
__decorate([
    (0, common_1.Post)(':id/resume/upload-url'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
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
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
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
    (0, common_1.Post)(':id/photo/upload-url'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a presigned URL to upload candidate photo' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { filename: { type: 'string' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Presigned upload URL' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "photoUploadUrl", null);
__decorate([
    (0, common_1.Post)(':id/photo/attach'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach uploaded photo to candidate' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { fileId: { type: 'string' }, s3Key: { type: 'string' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Photo attached to candidate' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('fileId')),
    __param(3, (0, common_1.Body)('s3Key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "attachPhoto", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.BULK),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Post)('import-from-file'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.BULK),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Import candidates from an uploaded CSV or Excel file' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { fileId: { type: 'string', description: 'ID of the uploaded file' } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Import results with success/failure counts' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file type or parsing error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "importFromFile", null);
__decorate([
    (0, common_1.Post)('resume/parse'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Parse a resume file to extract candidate info' }),
    (0, swagger_1.ApiBody)({ type: resume_parser_dto_1.ParseResumeDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resume parsed successfully', type: resume_parser_dto_1.ParsedResumeResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file type' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, resume_parser_dto_1.ParseResumeDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "parseResume", null);
__decorate([
    (0, common_1.Post)('resume/parse-bulk'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.BULK),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Parse multiple resume files' }),
    (0, swagger_1.ApiBody)({ type: resume_parser_dto_1.BulkParseResumesDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumes parsed', type: resume_parser_dto_1.BulkParseResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, resume_parser_dto_1.BulkParseResumesDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "parseResumesBulk", null);
__decorate([
    (0, common_1.Post)('from-resume'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a candidate from parsed resume data (review-then-save)' }),
    (0, swagger_1.ApiBody)({ type: resume_parser_dto_1.CreateCandidateFromResumeDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidate created from resume' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Resume file not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, resume_parser_dto_1.CreateCandidateFromResumeDto]),
    __metadata("design:returntype", Promise)
], CandidatesController.prototype, "createFromResume", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all documents for a candidate' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of documents' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Get)(':id/notes'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.READ),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all notes for a candidate' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of notes with author details' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "listNotes", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a note to a candidate' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiBody)({ type: candidate_note_dto_1.CreateCandidateNoteDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Note created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, candidate_note_dto_1.CreateCandidateNoteDto]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "addNote", null);
__decorate([
    (0, common_1.Patch)(':id/notes/:noteId'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a candidate note (author or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiParam)({ name: 'noteId', description: 'Note ID' }),
    (0, swagger_1.ApiBody)({ type: candidate_note_dto_1.UpdateCandidateNoteDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, candidate_note_dto_1.UpdateCandidateNoteDto]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Delete)(':id/notes/:noteId'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.WRITE),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a candidate note (author or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Candidate ID' }),
    (0, swagger_1.ApiParam)({ name: 'noteId', description: 'Note ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Note deleted' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('noteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CandidatesController.prototype, "deleteNote", null);
exports.CandidatesController = CandidatesController = __decorate([
    (0, swagger_1.ApiTags)('candidates'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/candidates'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [candidates_service_1.CandidatesService,
        stage_transition_service_1.StageTransitionService,
        resume_parser_service_1.ResumeParserService])
], CandidatesController);
//# sourceMappingURL=candidates.controller.js.map