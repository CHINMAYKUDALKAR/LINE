import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { RecycleBinService } from '../recycle-bin/recycle-bin.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { StorageService } from '../storage/storage.service';
import { Queue } from 'bullmq';
import { IntegrationEventsService } from '../integrations/services/integration-events.service';
export declare class CandidatesService {
    private prisma;
    private storageService;
    private importQueue;
    private eventEmitter;
    private recycleBinService;
    private integrationEvents;
    constructor(prisma: PrismaService, storageService: StorageService, importQueue: Queue, eventEmitter: EventEmitter2, recycleBinService: RecycleBinService, integrationEvents: IntegrationEventsService);
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
            updatedAt: Date;
            roleTitle: string | null;
            stage: string;
            source: string | null;
            createdById: string | null;
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
    importFromFile(tenantId: string, userId: string, fileId: string): Promise<{
        success: number;
        failed: number;
        duplicates: string[];
        errors: Array<{
            row: number;
            message: string;
        }>;
        totalRows: number;
    }>;
    listDocuments(tenantId: string, candidateId: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: import(".prisma/client").Prisma.JsonValue;
            filename: string;
            mimeType: string | null;
            size: number | null;
        }[];
    }>;
    listNotes(tenantId: string, candidateId: string, page?: number, perPage?: number): Promise<{
        data: {
            author: {
                name: string | null;
                id: string;
                email: string;
            };
            id: string;
            tenantId: string;
            candidateId: string;
            authorId: string;
            content: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            totalPages: number;
        };
    }>;
    private sanitizeContent;
    addNote(tenantId: string, candidateId: string, userId: string, content: string): Promise<{
        author: {
            name: string | null;
            id: string;
            email: string;
        };
        id: string;
        tenantId: string;
        candidateId: string;
        authorId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateNote(tenantId: string, noteId: string, userId: string, userRole: string, content: string): Promise<{
        id: string;
        tenantId: string;
        candidateId: string;
        authorId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteNote(tenantId: string, noteId: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    logResumeParseAction(tenantId: string, userId: string, fileId: string, status: string): Promise<void>;
    logBulkResumeParseAction(tenantId: string, userId: string, fileIds: string[], summary: {
        total: number;
        parsed: number;
        partiallyParsed: number;
        unparsable: number;
    }): Promise<void>;
    createFromResume(tenantId: string, userId: string, dto: {
        fileId: string;
        name: string;
        email?: string;
        phone?: string;
        skills?: string[];
        roleTitle?: string;
        stage?: string;
    }): Promise<{
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
    private parseSort;
}
