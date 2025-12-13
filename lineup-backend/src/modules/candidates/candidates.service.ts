import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { RecycleBinService } from '../recycle-bin/recycle-bin.service';
import { invalidateCache } from '../../common/cache.util';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { StorageService } from '../storage/storage.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CandidatesService {
    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
        @InjectQueue('candidate-import') private importQueue: Queue,
        private eventEmitter: EventEmitter2,
        private recycleBinService: RecycleBinService
    ) { }

    async create(tenantId: string, userId: string, dto: CreateCandidateDto) {
        if (dto.email) {
            const existing = await this.prisma.candidate.findFirst({
                where: { tenantId, email: dto.email },
            });
            if (existing) throw new BadRequestException('Candidate with this email already exists');
        }

        const candidate = await this.prisma.candidate.create({
            data: {
                tenantId,
                createdById: userId,
                ...(dto as any),
            },
        });

        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_CREATE', metadata: { id: candidate.id, name: candidate.name } }
        });

        await invalidateCache(`reports:${tenantId}:*`);

        return candidate;
    }

    async update(tenantId: string, userId: string | undefined, id: string, dto: UpdateCandidateDto) {
        const candidate = await this.get(tenantId, id);

        const updated = await this.prisma.candidate.update({
            where: { id },
            data: dto
        });

        await this.prisma.auditLog.create({
            data: { tenantId, userId: userId || null, action: 'CANDIDATE_UPDATE', metadata: { id, changes: dto as any } }
        });

        if (dto.stage && dto.stage !== candidate.stage) {
            this.eventEmitter.emit('candidate.stage.updated', {
                tenantId,
                candidateId: id,
                stage: dto.stage,
                previousStage: candidate.stage
            });
        }

        await invalidateCache(`reports:${tenantId}:*`);

        return updated;
    }

    async get(tenantId: string, id: string) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id } });
        if (!candidate || candidate.tenantId !== tenantId) {
            throw new NotFoundException('Candidate not found');
        }
        return candidate;
    }

    async list(tenantId: string, dto: ListCandidatesDto) {
        const page = Number(dto.page) || 1;
        const perPage = Number(dto.perPage) || 20;
        const where: any = {
            tenantId,
            deletedAt: null
        };

        if (dto.stage) where.stage = dto.stage;
        if (dto.source) where.source = dto.source;
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

    async delete(tenantId: string, userId: string, id: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: { interviews: true } // Include related data for full snapshot
        });

        if (!candidate || candidate.tenantId !== tenantId) {
            throw new NotFoundException('Candidate not found');
        }

        // Use new field names: module, itemId, itemSnapshot (full object)
        await this.recycleBinService.softDelete(tenantId, userId, 'candidate', id, candidate);

        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_DELETE', metadata: { id } }
        });

        await invalidateCache(`reports:${tenantId}:*`);

        return { success: true };
    }

    /**
     * NEW: Generate resume upload URL using StorageService
     * This replaces the old direct S3 upload method
     */
    async generateResumeUploadUrl(tenantId: string, userId: string, candidateId: string, filename: string) {
        await this.get(tenantId, candidateId);

        // Use StorageService to generate upload URL with FileObject tracking
        const result = await this.storageService.generateUploadUrl(tenantId, userId, {
            filename,
            linkedType: 'candidate',
            linkedId: candidateId,
        });

        return result;
    }

    /**
     * NEW: Attach resume using StorageService
     * This confirms the upload and triggers scanning/text extraction
     */
    async attachResume(tenantId: string, userId: string, candidateId: string, fileId: string, s3Key: string, mimeType?: string, size?: number) {
        await this.get(tenantId, candidateId);

        // Attach file via StorageService (triggers scanning & text extraction)
        await this.storageService.attachFile(tenantId, userId, {
            fileId,
            s3Key,
            mimeType,
            size,
        });

        // Backward compatibility: Update candidate.resumeUrl
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: { resumeUrl: s3Key }
        });

        await this.prisma.auditLog.create({
            data: { tenantId, userId, action: 'CANDIDATE_RESUME_ATTACH', metadata: { candidateId, fileId, s3Key } }
        });

        return { success: true, fileId };
    }

    async bulkImport(tenantId: string, userId: string, dto: BulkImportDto) {
        await this.importQueue.add('import', {
            tenantId,
            userId,
            url: dto.url,
            mode: dto.mode
        });
        return { message: 'Import job enqueued' };
    }

    /**
     * Direct bulk import - accepts parsed CSV rows from frontend
     */
    async directBulkImport(tenantId: string, userId: string, rows: Array<{
        name: string;
        email?: string;
        phone?: string;
        roleTitle?: string;
        source?: string;
        stage?: string;
        tags?: string;
        notes?: string;
        resumeUrl?: string;
    }>) {
        const result = {
            success: 0,
            failed: 0,
            duplicates: [] as string[],
            errors: [] as Array<{ row: number; message: string }>,
        };

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!row.name) {
                result.errors.push({ row: i + 1, message: 'Name is required' });
                result.failed++;
                continue;
            }

            try {
                // Check for duplicates by email
                if (row.email) {
                    const existing = await this.prisma.candidate.findFirst({
                        where: { tenantId, email: row.email },
                    });
                    if (existing) {
                        result.duplicates.push(row.email);
                        continue;
                    }
                }

                // Parse tags if provided as comma-separated string
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
            } catch (error: any) {
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

    private parseSort(sort: string) {
        const [field, dir] = sort.split(':');
        return { [field]: dir };
    }
}