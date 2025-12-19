import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { TransitionStageDto, RejectCandidateDto } from './dto/transition-stage.dto';
import { ParseResumeDto, BulkParseResumesDto, CreateCandidateFromResumeDto } from './dto/resume-parser.dto';
import { StageTransitionService } from './services/stage-transition.service';
import { ResumeParserService } from './services/resume-parser.service';
export declare class CandidatesController {
    private svc;
    private stageTransitionService;
    private resumeParserService;
    constructor(svc: CandidatesService, stageTransitionService: StageTransitionService, resumeParserService: ResumeParserService);
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
    transitionStage(req: any, id: string, dto: TransitionStageDto): Promise<import("./services/stage-transition.service").StageTransitionResult>;
    rejectCandidate(req: any, id: string, dto: RejectCandidateDto): Promise<import("./services/stage-transition.service").StageTransitionResult>;
    getStageHistory(req: any, id: string): Promise<{
        actor: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        id: string;
        tenantId: string;
        candidateId: string;
        previousStage: string;
        newStage: string;
        source: string;
        triggeredBy: string;
        actorId: string | null;
        reason: string | null;
        createdAt: Date;
    }[]>;
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
    parseResume(req: any, dto: ParseResumeDto): Promise<import("./services/resume-parser.service").ParsedResume>;
    parseResumesBulk(req: any, dto: BulkParseResumesDto): Promise<{
        results: import("./services/resume-parser.service").ParsedResume[];
        summary: {
            total: number;
            parsed: number;
            partiallyParsed: number;
            unparsable: number;
        };
    }>;
    createFromResume(req: any, dto: CreateCandidateFromResumeDto): Promise<{
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
    listDocuments(req: any, id: string): Promise<{
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
    listNotes(req: any, id: string): Promise<{
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
    addNote(req: any, id: string, dto: CreateCandidateNoteDto): Promise<{
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
