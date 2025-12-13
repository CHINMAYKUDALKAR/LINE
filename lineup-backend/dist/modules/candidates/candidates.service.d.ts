import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { RecycleBinService } from '../recycle-bin/recycle-bin.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { StorageService } from '../storage/storage.service';
import { Queue } from 'bullmq';
export declare class CandidatesService {
    private prisma;
    private storageService;
    private importQueue;
    private eventEmitter;
    private recycleBinService;
    constructor(prisma: PrismaService, storageService: StorageService, importQueue: Queue, eventEmitter: EventEmitter2, recycleBinService: RecycleBinService);
    create(tenantId: string, userId: string, dto: CreateCandidateDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string | null;
        phone: string | null;
        roleTitle: string | null;
        stage: string;
        source: string | null;
        resumeUrl: string | null;
        notes: string | null;
        tags: string[];
        createdById: string | null;
        overallScore: number | null;
        lastFeedbackAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(tenantId: string, userId: string | undefined, id: string, dto: UpdateCandidateDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string | null;
        phone: string | null;
        roleTitle: string | null;
        stage: string;
        source: string | null;
        resumeUrl: string | null;
        notes: string | null;
        tags: string[];
        createdById: string | null;
        overallScore: number | null;
        lastFeedbackAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    get(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string | null;
        phone: string | null;
        roleTitle: string | null;
        stage: string;
        source: string | null;
        resumeUrl: string | null;
        notes: string | null;
        tags: string[];
        createdById: string | null;
        overallScore: number | null;
        lastFeedbackAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    list(tenantId: string, dto: ListCandidatesDto): Promise<{
        data: {
            name: string;
            id: string;
            email: string | null;
            createdAt: Date;
            roleTitle: string | null;
            stage: string;
            source: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    delete(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    generateResumeUploadUrl(tenantId: string, userId: string, candidateId: string, filename: string): Promise<{
        fileId: string;
        uploadUrl: string;
        s3Key: string;
    }>;
    attachResume(tenantId: string, userId: string, candidateId: string, fileId: string, s3Key: string, mimeType?: string, size?: number): Promise<{
        success: boolean;
        fileId: string;
    }>;
    bulkImport(tenantId: string, userId: string, dto: BulkImportDto): Promise<{
        message: string;
    }>;
    directBulkImport(tenantId: string, userId: string, rows: Array<{
        name: string;
        email?: string;
        phone?: string;
        roleTitle?: string;
        source?: string;
        stage?: string;
        tags?: string;
        notes?: string;
        resumeUrl?: string;
    }>): Promise<{
        success: number;
        failed: number;
        duplicates: string[];
        errors: Array<{
            row: number;
            message: string;
        }>;
    }>;
    private parseSort;
}
