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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const s3_service_1 = require("../../common/s3.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const mime_util_1 = require("./utils/mime.util");
let StorageService = class StorageService {
    prisma;
    s3;
    scanQueue;
    extractQueue;
    constructor(prisma, s3, scanQueue, extractQueue) {
        this.prisma = prisma;
        this.s3 = s3;
        this.scanQueue = scanQueue;
        this.extractQueue = extractQueue;
    }
    async generateUploadUrl(tenantId, userId, dto) {
        const mimeType = (0, mime_util_1.getMimeType)(dto.filename);
        if (!(0, mime_util_1.isAllowedMimeType)(mimeType, dto.linkedType)) {
            throw new common_1.BadRequestException(`File type ${mimeType} not allowed for ${dto.linkedType}`);
        }
        let version = 1;
        if (dto.linkedType && dto.linkedId) {
            const existing = await this.prisma.fileObject.findMany({
                where: {
                    tenantId,
                    linkedType: dto.linkedType,
                    linkedId: dto.linkedId,
                    filename: dto.filename,
                    status: { not: 'deleted' },
                },
                orderBy: { version: 'desc' },
                take: 1,
            });
            if (existing.length > 0) {
                version = existing[0].version + 1;
            }
        }
        const fileObject = await this.prisma.fileObject.create({
            data: {
                tenantId,
                ownerId: userId,
                linkedType: dto.linkedType,
                linkedId: dto.linkedId,
                filename: dto.filename,
                mimeType,
                version,
                status: 'pending',
                key: '',
            },
        });
        const s3Key = this.generateS3Key(tenantId, dto.linkedType, dto.linkedId, fileObject.id, dto.filename);
        const uploadUrl = await this.s3.getPresignedUploadUrl(s3Key, mimeType);
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'FILE_UPLOAD_INITIATED',
                metadata: { fileId: fileObject.id, filename: dto.filename },
            },
        });
        return {
            fileId: fileObject.id,
            uploadUrl,
            s3Key,
        };
    }
    async attachFile(tenantId, userId, dto) {
        const fileObject = await this.prisma.fileObject.findUnique({
            where: { id: dto.fileId },
        });
        if (!fileObject || fileObject.tenantId !== tenantId) {
            throw new common_1.NotFoundException('File not found');
        }
        if (dto.size && !(0, mime_util_1.validateFileSize)(dto.size)) {
            throw new common_1.BadRequestException('File size exceeds maximum allowed (100MB)');
        }
        const updated = await this.prisma.fileObject.update({
            where: { id: dto.fileId },
            data: {
                key: dto.s3Key,
                status: 'active',
                scanStatus: 'pending',
                mimeType: dto.mimeType || fileObject.mimeType,
                size: dto.size,
            },
        });
        await this.scanQueue.add('scan', {
            fileId: dto.fileId,
            tenantId,
            s3Key: dto.s3Key,
        });
        if (dto.mimeType?.includes('pdf') || dto.mimeType?.includes('word') || dto.mimeType?.includes('document')) {
            await this.extractQueue.add('extract', {
                fileId: dto.fileId,
                tenantId,
                s3Key: dto.s3Key,
                mimeType: dto.mimeType,
            });
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'FILE_UPLOADED',
                metadata: { fileId: dto.fileId, s3Key: dto.s3Key, size: dto.size },
            },
        });
        return updated;
    }
    async listFiles(tenantId, dto) {
        const page = Number(dto.page) || 1;
        const perPage = Number(dto.perPage) || 20;
        const where = { tenantId };
        if (dto.linkedType)
            where.linkedType = dto.linkedType;
        if (dto.linkedId)
            where.linkedId = dto.linkedId;
        if (dto.status)
            where.status = dto.status;
        if (dto.filename) {
            where.filename = { contains: dto.filename, mode: 'insensitive' };
        }
        const [total, data] = await Promise.all([
            this.prisma.fileObject.count({ where }),
            this.prisma.fileObject.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                perPage,
                lastPage: Math.ceil(total / perPage),
            },
        };
    }
    async getFile(tenantId, fileId) {
        const file = await this.prisma.fileObject.findUnique({
            where: { id: fileId },
        });
        if (!file || file.tenantId !== tenantId) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async streamFile(tenantId, fileId, user) {
        const file = await this.getFile(tenantId, fileId);
        if (!this.canAccessFile(user, file)) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const downloadUrl = await this.s3.getPresignedDownloadUrl(file.key, file.filename);
        return { downloadUrl, filename: file.filename };
    }
    async updateMetadata(tenantId, fileId, dto) {
        const file = await this.getFile(tenantId, fileId);
        return this.prisma.fileObject.update({
            where: { id: fileId },
            data: {
                metadata: dto.metadata !== undefined ? dto.metadata : file.metadata,
                status: dto.status || file.status,
            },
        });
    }
    async softDelete(tenantId, userId, fileId) {
        const file = await this.getFile(tenantId, fileId);
        await this.prisma.fileObject.update({
            where: { id: fileId },
            data: {
                status: 'deleted',
                deletedAt: new Date(),
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'FILE_DELETED',
                metadata: { fileId },
            },
        });
        return { success: true };
    }
    async restoreFile(tenantId, userId, fileId) {
        const file = await this.getFile(tenantId, fileId);
        if (file.status !== 'deleted') {
            throw new common_1.BadRequestException('File is not deleted');
        }
        await this.prisma.fileObject.update({
            where: { id: fileId },
            data: {
                status: 'active',
                deletedAt: null,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'FILE_RESTORED',
                metadata: { fileId },
            },
        });
        return { success: true };
    }
    async listVersions(tenantId, fileId) {
        const file = await this.getFile(tenantId, fileId);
        return this.prisma.fileObject.findMany({
            where: {
                tenantId,
                linkedType: file.linkedType,
                linkedId: file.linkedId,
                filename: file.filename,
            },
            orderBy: { version: 'desc' },
        });
    }
    async getRecycleBin(tenantId) {
        return this.prisma.fileObject.findMany({
            where: {
                tenantId,
                status: 'deleted',
            },
            orderBy: { deletedAt: 'desc' },
        });
    }
    generateS3Key(tenantId, linkedType, linkedId, fileId, filename) {
        if (linkedType && linkedId) {
            return `${tenantId}/${linkedType}/${linkedId}/files/${fileId}/${filename}`;
        }
        return `${tenantId}/files/${fileId}/${filename}`;
    }
    canAccessFile(user, file) {
        if (user.role === 'ADMIN')
            return true;
        if (file.linkedType === 'candidate') {
            return ['MANAGER', 'RECRUITER'].includes(user.role);
        }
        if (file.linkedType === 'interview') {
            return ['MANAGER', 'INTERVIEWER'].includes(user.role);
        }
        if (file.linkedType === 'user') {
            return file.linkedId === user.id;
        }
        return false;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('file-scan')),
    __param(3, (0, bullmq_1.InjectQueue)('file-text-extract')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service,
        bullmq_2.Queue,
        bullmq_2.Queue])
], StorageService);
//# sourceMappingURL=storage.service.js.map