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
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
const recycle_bin_service_1 = require("../recycle-bin/recycle-bin.service");
const cache_util_1 = require("../../common/cache.util");
const storage_service_1 = require("../storage/storage.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let CandidatesService = class CandidatesService {
    prisma;
    storageService;
    importQueue;
    eventEmitter;
    recycleBinService;
    constructor(prisma, storageService, importQueue, eventEmitter, recycleBinService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.importQueue = importQueue;
        this.eventEmitter = eventEmitter;
        this.recycleBinService = recycleBinService;
    }
    async create(tenantId, userId, dto) {
        if (dto.email) {
            const existing = await this.prisma.candidate.findFirst({
                where: { tenantId, email: dto.email },
            });
            if (existing)
                throw new common_1.BadRequestException('Candidate with this email already exists');
        }
        const candidate = await this.prisma.candidate.create({
            data: {
                tenantId,
                createdById: userId,
                ...dto,
            },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_CREATE', metadata: { id: candidate.id, name: candidate.name } }
        });
        await (0, cache_util_1.invalidateCache)(`reports:${tenantId}:*`);
        return candidate;
    }
    async update(tenantId, userId, id, dto) {
        const candidate = await this.get(tenantId, id);
        const updated = await this.prisma.candidate.update({
            where: { id },
            data: dto
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId: userId || null, action: 'CANDIDATE_UPDATE', metadata: { id, changes: dto } }
        });
        if (dto.stage && dto.stage !== candidate.stage) {
            this.eventEmitter.emit('candidate.stage.updated', {
                tenantId,
                candidateId: id,
                stage: dto.stage,
                previousStage: candidate.stage
            });
        }
        await (0, cache_util_1.invalidateCache)(`reports:${tenantId}:*`);
        return updated;
    }
    async get(tenantId, id) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id } });
        if (!candidate || candidate.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        return candidate;
    }
    async list(tenantId, dto) {
        const page = Number(dto.page) || 1;
        const perPage = Number(dto.perPage) || 20;
        const where = {
            tenantId,
            deletedAt: null
        };
        if (dto.stage)
            where.stage = dto.stage;
        if (dto.source)
            where.source = dto.source;
        if (dto.q) {
            where.OR = [
                { name: { contains: dto.q, mode: 'insensitive' } },
                { email: { contains: dto.q, mode: 'insensitive' } },
                { roleTitle: { contains: dto.q, mode: 'insensitive' } }
            ];
        }
        const [total, data] = await Promise.all([
            this.prisma.candidate.count({ where }),
            this.prisma.candidate.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: dto.sort ? this.parseSort(dto.sort) : { createdAt: 'desc' },
                select: { id: true, name: true, email: true, stage: true, roleTitle: true, createdAt: true, source: true }
            })
        ]);
        return { data, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
    }
    async delete(tenantId, userId, id) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: { interviews: true }
        });
        if (!candidate || candidate.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        await this.recycleBinService.softDelete(tenantId, userId, 'candidate', id, candidate);
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_DELETE', metadata: { id } }
        });
        await (0, cache_util_1.invalidateCache)(`reports:${tenantId}:*`);
        return { success: true };
    }
    async generateResumeUploadUrl(tenantId, userId, candidateId, filename) {
        await this.get(tenantId, candidateId);
        const result = await this.storageService.generateUploadUrl(tenantId, userId, {
            filename,
            linkedType: 'candidate',
            linkedId: candidateId,
        });
        return result;
    }
    async attachResume(tenantId, userId, candidateId, fileId, s3Key, mimeType, size) {
        await this.get(tenantId, candidateId);
        await this.storageService.attachFile(tenantId, userId, {
            fileId,
            s3Key,
            mimeType,
            size,
        });
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: { resumeUrl: s3Key }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_RESUME_ATTACH', metadata: { candidateId, fileId, s3Key } }
        });
        return { success: true, fileId };
    }
    async bulkImport(tenantId, userId, dto) {
        await this.importQueue.add('import', {
            tenantId,
            userId,
            url: dto.url,
            mode: dto.mode
        });
        return { message: 'Import job enqueued' };
    }
    async directBulkImport(tenantId, userId, rows) {
        const result = {
            success: 0,
            failed: 0,
            duplicates: [],
            errors: [],
        };
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.name) {
                result.errors.push({ row: i + 1, message: 'Name is required' });
                result.failed++;
                continue;
            }
            try {
                if (row.email) {
                    const existing = await this.prisma.candidate.findFirst({
                        where: { tenantId, email: row.email },
                    });
                    if (existing) {
                        result.duplicates.push(row.email);
                        continue;
                    }
                }
                const tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                await this.prisma.candidate.create({
                    data: {
                        tenantId,
                        createdById: userId,
                        name: row.name,
                        email: row.email || null,
                        phone: row.phone || null,
                        roleTitle: row.roleTitle || null,
                        source: row.source || null,
                        stage: row.stage || 'applied',
                        tags,
                        notes: row.notes || null,
                        resumeUrl: row.resumeUrl || null,
                    },
                });
                result.success++;
            }
            catch (error) {
                result.errors.push({ row: i + 1, message: error.message || 'Unknown error' });
                result.failed++;
            }
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'CANDIDATE_BULK_IMPORT',
                metadata: { success: result.success, failed: result.failed, duplicates: result.duplicates.length },
            },
        });
        return result;
    }
    parseSort(sort) {
        const [field, dir] = sort.split(':');
        return { [field]: dir };
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)('candidate-import')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        bullmq_2.Queue,
        event_emitter_1.EventEmitter2,
        recycle_bin_service_1.RecycleBinService])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map