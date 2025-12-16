import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
export declare class CandidatesController {
    private svc;
    constructor(svc: CandidatesService);
    create(req: any, dto: CreateCandidateDto): Promise<{
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
    list(req: any, dto: ListCandidatesDto): Promise<{
        data: {
            id: string;
            name: string;
            email: string | null;
            roleTitle: string | null;
            stage: string;
            source: string | null;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    get(req: any, id: string): Promise<{
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
    update(req: any, id: string, dto: UpdateCandidateDto): Promise<{
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
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
    uploadUrl(req: any, id: string, filename: string): Promise<{
        fileId: string;
        uploadUrl: string;
        s3Key: string;
    }>;
    attachResume(req: any, id: string, fileId: string, s3Key: string, mimeType?: string, size?: number): Promise<{
        success: boolean;
        fileId: string;
    }>;
    bulkImport(req: any, body: any): Promise<{
        success: number;
        failed: number;
        duplicates: string[];
        errors: {
            row: number;
            message: string;
        }[];
    }> | Promise<{
        message: string;
    }>;
    listDocuments(req: any, id: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            filename: string;
            mimeType: string | null;
            size: number | null;
            metadata: import(".prisma/client").Prisma.JsonValue;
        }[];
    }>;
    listNotes(req: any, id: string): Promise<{
        data: {
            author: {
                id: string;
                name: string | null;
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
    addNote(req: any, id: string, dto: CreateCandidateNoteDto): Promise<{
        author: {
            id: string;
            name: string | null;
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
    updateNote(req: any, noteId: string, dto: UpdateCandidateNoteDto): Promise<{
        id: string;
        tenantId: string;
        candidateId: string;
        authorId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteNote(req: any, noteId: string): Promise<{
        success: boolean;
    }>;
}
