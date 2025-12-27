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
const integration_events_service_1 = require("../integrations/services/integration-events.service");
const spreadsheet_parser_util_1 = require("./utils/spreadsheet-parser.util");
let CandidatesService = class CandidatesService {
    prisma;
    storageService;
    importQueue;
    eventEmitter;
    recycleBinService;
    integrationEvents;
    constructor(prisma, storageService, importQueue, eventEmitter, recycleBinService, integrationEvents) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.importQueue = importQueue;
        this.eventEmitter = eventEmitter;
        this.recycleBinService = recycleBinService;
        this.integrationEvents = integrationEvents;
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
        this.integrationEvents.onCandidateCreated(tenantId, candidate.id, userId).catch(() => { });
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
            this.integrationEvents.onCandidateStageChanged(tenantId, id, dto.stage, userId || undefined).catch(() => { });
        }
        else {
            this.integrationEvents.onCandidateUpdated(tenantId, id, userId || undefined).catch(() => { });
        }
        await (0, cache_util_1.invalidateCache)(`reports:${tenantId}:*`);
        return updated;
    }
    async get(tenantId, id) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                opportunityLinks: {
                    include: {
                        opportunityContext: true,
                    },
                },
                externalFeedback: {
                    orderBy: { interviewDate: 'desc' },
                },
            },
        });
        if (!candidate || candidate.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        return candidate;
    }
    async list(tenantId, dto) {
        const page = Number(dto.page) || 1;
        const perPage = Math.min(Number(dto.perPage) || 20, 10000);
        const where = {
            tenantId,
            deletedAt: null
        };
        if (dto.stage)
            where.stage = { equals: dto.stage, mode: 'insensitive' };
        if (dto.source) {
            if (dto.source === 'ZOHO_CRM') {
                where.source = { in: ['ZOHO_CRM', 'ZOHO_LEAD', 'ZOHO_CONTACT'] };
            }
            else if (dto.source === 'SALESFORCE') {
                where.source = { in: ['SALESFORCE', 'SALESFORCE_LEAD', 'SALESFORCE_CONTACT'] };
            }
            else {
                where.source = dto.source;
            }
        }
        if (dto.role)
            where.roleTitle = { contains: dto.role, mode: 'insensitive' };
        if (dto.recruiterId && dto.recruiterId !== 'all')
            where.createdById = dto.recruiterId;
        if (dto.dateFrom || dto.dateTo) {
            where.createdAt = { ...where.createdAt };
            if (dto.dateFrom)
                where.createdAt.gte = new Date(dto.dateFrom);
            if (dto.dateTo)
                where.createdAt.lte = new Date(dto.dateTo);
        }
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
                orderBy: dto.sort ? this.parseSort(dto.sort) : { createdAt: 'asc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    stage: true,
                    roleTitle: true,
                    createdAt: true,
                    updatedAt: true,
                    source: true,
                    createdById: true
                }
            })
        ]);
        const candidateIds = data.map(c => c.id);
        const now = new Date();
        const activeInterviews = await this.prisma.interview.findMany({
            where: {
                tenantId,
                candidateId: { in: candidateIds },
                status: 'SCHEDULED',
                date: { gt: now },
            },
            select: { candidateId: true, id: true, date: true, status: true },
        });
        const activeInterviewMap = new Map(activeInterviews.map(i => [i.candidateId, { interviewId: i.id, interviewDate: i.date }]));
        const enrichedData = data.map(candidate => ({
            ...candidate,
            hasActiveInterview: activeInterviewMap.has(candidate.id),
            activeInterviewId: activeInterviewMap.get(candidate.id)?.interviewId,
            activeInterviewDate: activeInterviewMap.get(candidate.id)?.interviewDate,
        }));
        return { data: enrichedData, meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) } };
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
    async generatePhotoUploadUrl(tenantId, userId, candidateId, filename) {
        await this.get(tenantId, candidateId);
        const result = await this.storageService.generateUploadUrl(tenantId, userId, {
            filename,
            linkedType: 'candidate',
            linkedId: candidateId,
        });
        return result;
    }
    async attachPhoto(tenantId, userId, candidateId, fileId, s3Key) {
        await this.get(tenantId, candidateId);
        await this.storageService.attachFile(tenantId, userId, {
            fileId,
            s3Key,
            mimeType: 'image/jpeg',
        });
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: { photoUrl: s3Key }
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_PHOTO_ATTACH', metadata: { candidateId, fileId, s3Key } }
        });
        return { success: true, fileId, photoUrl: s3Key };
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
        const validStages = await this.prisma.hiringStage.findMany({
            where: { tenantId, isActive: true },
            select: { key: true, name: true },
        });
        const stageMap = new Map();
        for (const stage of validStages) {
            stageMap.set(stage.key.toLowerCase(), stage.key);
            stageMap.set(stage.name.toLowerCase(), stage.key);
            stageMap.set(stage.key.toLowerCase().replace(/-/g, '_'), stage.key);
            stageMap.set(stage.key.toLowerCase().replace(/_/g, '-'), stage.key);
            stageMap.set(stage.name.toLowerCase().replace(/ /g, '-'), stage.key);
            stageMap.set(stage.name.toLowerCase().replace(/ /g, '_'), stage.key);
        }
        const normalizeStage = (inputStage) => {
            if (!inputStage)
                return 'APPLIED';
            const normalized = inputStage.trim().toLowerCase();
            if (stageMap.has(normalized)) {
                return stageMap.get(normalized);
            }
            const withUnderscores = normalized.replace(/-/g, '_');
            if (stageMap.has(withUnderscores)) {
                return stageMap.get(withUnderscores);
            }
            const withHyphens = normalized.replace(/_/g, '-');
            if (stageMap.has(withHyphens)) {
                return stageMap.get(withHyphens);
            }
            return 'APPLIED';
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
                if (!row.email && row.phone) {
                    const existing = await this.prisma.candidate.findFirst({
                        where: { tenantId, phone: row.phone },
                    });
                    if (existing) {
                        result.duplicates.push(row.phone);
                        continue;
                    }
                }
                if (!row.email && row.phone && row.name) {
                    const existing = await this.prisma.candidate.findFirst({
                        where: { tenantId, name: row.name, phone: row.phone },
                    });
                    if (existing) {
                        result.duplicates.push(`${row.name} (${row.phone})`);
                        continue;
                    }
                }
                const tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                const normalizedStage = normalizeStage(row.stage);
                await this.prisma.candidate.create({
                    data: {
                        tenantId,
                        createdById: userId,
                        name: row.name,
                        email: row.email || null,
                        phone: row.phone || null,
                        roleTitle: row.roleTitle || null,
                        source: row.source || null,
                        stage: normalizedStage,
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
    async importFromFile(tenantId, userId, fileId) {
        const file = await this.prisma.fileObject.findFirst({
            where: { id: fileId, tenantId },
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        const mimeType = file.mimeType || 'application/octet-stream';
        if (!(0, spreadsheet_parser_util_1.isSupportedSpreadsheet)(mimeType)) {
            throw new common_1.BadRequestException(`Unsupported file type: ${mimeType}. Please upload a CSV or Excel file.`);
        }
        const buffer = await this.storageService.downloadFile(file.key);
        let rows;
        try {
            rows = (0, spreadsheet_parser_util_1.parseSpreadsheet)(buffer, mimeType);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse file: ${error.message}`);
        }
        if (rows.length === 0) {
            throw new common_1.BadRequestException('File contains no valid candidate rows');
        }
        const result = await this.directBulkImport(tenantId, userId, rows);
        return {
            ...result,
            totalRows: rows.length,
        };
    }
    async listDocuments(tenantId, candidateId) {
        await this.get(tenantId, candidateId);
        const files = await this.prisma.fileObject.findMany({
            where: {
                tenantId,
                linkedType: 'candidate',
                linkedId: candidateId,
                status: 'active',
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                filename: true,
                mimeType: true,
                size: true,
                createdAt: true,
                updatedAt: true,
                metadata: true,
            },
        });
        return { data: files };
    }
    async listNotes(tenantId, candidateId, page = 1, perPage = 20) {
        await this.get(tenantId, candidateId);
        const skip = (page - 1) * perPage;
        const [notes, total] = await Promise.all([
            this.prisma.candidateNote.findMany({
                where: { tenantId, candidateId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: perPage,
            }),
            this.prisma.candidateNote.count({ where: { tenantId, candidateId } }),
        ]);
        const authorIds = [...new Set(notes.map(n => n.authorId))];
        const authors = authorIds.length > 0 ? await this.prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, email: true },
        }) : [];
        const authorMap = new Map(authors.map(a => [a.id, a]));
        const enrichedNotes = notes.map(note => ({
            ...note,
            author: authorMap.get(note.authorId) || { id: note.authorId, name: 'Unknown', email: '' },
        }));
        return {
            data: enrichedNotes,
            meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
        };
    }
    sanitizeContent(content) {
        return content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    async addNote(tenantId, candidateId, userId, content) {
        await this.get(tenantId, candidateId);
        const sanitizedContent = this.sanitizeContent(content);
        const note = await this.prisma.candidateNote.create({
            data: {
                tenantId,
                candidateId,
                authorId: userId,
                content: sanitizedContent,
            },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_NOTE_ADD', metadata: { candidateId, noteId: note.id } },
        });
        const author = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });
        return { ...note, author: author || { id: userId, name: 'Unknown', email: '' } };
    }
    async updateNote(tenantId, noteId, userId, userRole, content) {
        const note = await this.prisma.candidateNote.findUnique({ where: { id: noteId } });
        if (!note || note.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only the author or an admin can update this note');
        }
        const sanitizedContent = this.sanitizeContent(content);
        const updated = await this.prisma.candidateNote.update({
            where: { id: noteId },
            data: { content: sanitizedContent },
        });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_NOTE_UPDATE', metadata: { noteId } },
        });
        return updated;
    }
    async deleteNote(tenantId, noteId, userId, userRole) {
        const note = await this.prisma.candidateNote.findUnique({ where: { id: noteId } });
        if (!note || note.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Note not found');
        }
        if (note.authorId !== userId && userRole !== 'ADMIN') {
            throw new common_1.BadRequestException('Only the author or an admin can delete this note');
        }
        await this.prisma.candidateNote.delete({ where: { id: noteId } });
        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_NOTE_DELETE', metadata: { noteId, candidateId: note.candidateId } },
        });
        return { success: true };
    }
    async logResumeParseAction(tenantId, userId, fileId, status) {
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'RESUME_PARSE',
                metadata: { fileId, status },
            },
        });
    }
    async logBulkResumeParseAction(tenantId, userId, fileIds, summary) {
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'RESUME_PARSE_BULK',
                metadata: { fileIds, summary },
            },
        });
    }
    async createFromResume(tenantId, userId, dto) {
        const file = await this.prisma.fileObject.findFirst({
            where: { id: dto.fileId, tenantId, deletedAt: null },
        });
        if (!file) {
            throw new common_1.NotFoundException('Resume file not found');
        }
        if (dto.email) {
            const existing = await this.prisma.candidate.findFirst({
                where: { tenantId, email: dto.email },
            });
            if (existing) {
                throw new common_1.BadRequestException('Candidate with this email already exists');
            }
        }
        const candidate = await this.prisma.candidate.create({
            data: {
                tenantId,
                createdById: userId,
                name: dto.name,
                email: dto.email || null,
                phone: dto.phone || null,
                roleTitle: dto.roleTitle || null,
                stage: dto.stage || 'APPLIED',
                tags: dto.skills || [],
                resumeUrl: file.key,
            },
        });
        await this.prisma.fileObject.update({
            where: { id: dto.fileId },
            data: {
                linkedType: 'candidate',
                linkedId: candidate.id,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'CANDIDATE_CREATE_FROM_RESUME',
                metadata: {
                    candidateId: candidate.id,
                    fileId: dto.fileId,
                    extractedFields: {
                        name: dto.name,
                        email: dto.email,
                        phone: dto.phone,
                        skills: dto.skills,
                    },
                },
            },
        });
        await (0, cache_util_1.invalidateCache)(`reports:${tenantId}:*`);
        return candidate;
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
        recycle_bin_service_1.RecycleBinService,
        integration_events_service_1.IntegrationEventsService])
], CandidatesService);
//# sourceMappingURL=candidates.service.js.map