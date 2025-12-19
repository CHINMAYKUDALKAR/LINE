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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const storage_service_1 = require("./storage.service");
const generate_upload_url_dto_1 = require("./dto/generate-upload-url.dto");
const attach_file_dto_1 = require("./dto/attach-file.dto");
const update_file_metadata_dto_1 = require("./dto/update-file-metadata.dto");
const list_files_dto_1 = require("./dto/list-files.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let StorageController = class StorageController {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    generateUploadUrl(req, dto) {
        return this.storageService.generateUploadUrl(req.user.tenantId, req.user.sub, dto);
    }
    attachFile(req, dto) {
        return this.storageService.attachFile(req.user.tenantId, req.user.sub, dto);
    }
    listFiles(req, dto) {
        return this.storageService.listFiles(req.user.tenantId, dto);
    }
    getRecycleBin(req) {
        return this.storageService.getRecycleBin(req.user.tenantId);
    }
    getFile(req, id) {
        return this.storageService.getFile(req.user.tenantId, id);
    }
    downloadFile(req, id) {
        return this.storageService.streamFile(req.user.tenantId, id, req.user);
    }
    listVersions(req, id) {
        return this.storageService.listVersions(req.user.tenantId, id);
    }
    updateMetadata(req, id, dto) {
        return this.storageService.updateMetadata(req.user.tenantId, id, dto);
    }
    deleteFile(req, id) {
        return this.storageService.softDelete(req.user.tenantId, req.user.sub, id);
    }
    restoreFile(req, id) {
        return this.storageService.restoreFile(req.user.tenantId, req.user.sub, id);
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate presigned upload URL for direct S3 upload' }),
    (0, swagger_1.ApiBody)({ type: generate_upload_url_dto_1.GenerateUploadUrlDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Presigned URL generated', schema: { example: { uploadUrl: 'https://...', fileId: 'abc123', expiresAt: '2024-01-01T00:00:00Z' } } }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file type or size' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_upload_url_dto_1.GenerateUploadUrlDto]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "generateUploadUrl", null);
__decorate([
    (0, common_1.Post)('attach'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach uploaded file to a candidate or interview' }),
    (0, swagger_1.ApiBody)({ type: attach_file_dto_1.AttachFileDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File attached successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Entity not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, attach_file_dto_1.AttachFileDto]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "attachFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all files with filters and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of files' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_files_dto_1.ListFilesDto]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)('recycle-bin'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get soft-deleted files in recycle bin' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of deleted files' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "getRecycleBin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file metadata and details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER'),
    (0, swagger_1.ApiOperation)({ summary: 'Download file or get presigned download URL' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File stream or download URL' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'RECRUITER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all versions of a file' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of file versions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "listVersions", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update file metadata (name, tags, etc.)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiBody)({ type: update_file_metadata_dto_1.UpdateFileMetadataDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File metadata updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_file_metadata_dto_1.UpdateFileMetadataDto]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "updateMetadata", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete file (moves to recycle bin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File moved to recycle bin' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore file from recycle bin' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File restored' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found or not deleted' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "restoreFile", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('storage'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/storage'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map