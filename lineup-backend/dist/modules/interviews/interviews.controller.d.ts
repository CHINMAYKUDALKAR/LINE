import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { ListInterviewsDto } from './dto/list-interviews.dto';
import { BulkScheduleDto } from './dto/bulk-schedule.dto';
import { CreateInterviewNoteDto, UpdateInterviewNoteDto } from './dto/interview-note.dto';
export declare class InterviewsController {
    private svc;
    constructor(svc: InterviewsService);
    create(req: any, dto: CreateInterviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        tenantId: string;
        status: string;
        deletedAt: Date | null;
        stage: string;
        notes: string | null;
        candidateId: string;
        interviewerIds: string[];
        durationMins: number;
        meetingLink: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        bulkMode: import("@prisma/client").$Enums.BulkMode | null;
        bulkBatchId: string | null;
        candidateIds: string[];
    }>;
    bulkSchedule(req: any, dto: BulkScheduleDto): Promise<import("./dto/bulk-schedule.dto").BulkScheduleResult>;
    reschedule(req: any, id: string, dto: RescheduleInterviewDto): Promise<{
        interview: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            tenantId: string;
            status: string;
            deletedAt: Date | null;
            stage: string;
            notes: string | null;
            candidateId: string;
            interviewerIds: string[];
            durationMins: number;
            meetingLink: string | null;
            avgRating: number | null;
            hasFeedback: boolean;
            isNoShow: boolean;
            bulkMode: import("@prisma/client").$Enums.BulkMode | null;
            bulkBatchId: string | null;
            candidateIds: string[];
        };
        conflicts: {
            interviewId: string;
            date: Date;
            duration: number;
            stage: string;
        }[];
        hasConflicts: boolean;
        message: string;
    }>;
    list(req: any, dto: ListInterviewsDto): Promise<{
        data: ({
            candidate: {
                name: string;
                email: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            tenantId: string;
            status: string;
            deletedAt: Date | null;
            stage: string;
            notes: string | null;
            candidateId: string;
            interviewerIds: string[];
            durationMins: number;
            meetingLink: string | null;
            avgRating: number | null;
            hasFeedback: boolean;
            isNoShow: boolean;
            bulkMode: import("@prisma/client").$Enums.BulkMode | null;
            bulkBatchId: string | null;
            candidateIds: string[];
        } & {
            interviewers: Array<{
                id: string;
                name: string | null;
                email: string;
                role: string;
            }>;
            candidateName: string;
            candidateEmail: string;
        })[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    get(req: any, id: string): Promise<{
        candidate: {
            name: string;
            email: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        tenantId: string;
        status: string;
        deletedAt: Date | null;
        stage: string;
        notes: string | null;
        candidateId: string;
        interviewerIds: string[];
        durationMins: number;
        meetingLink: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        bulkMode: import("@prisma/client").$Enums.BulkMode | null;
        bulkBatchId: string | null;
        candidateIds: string[];
    } & {
        interviewers: Array<{
            id: string;
            name: string | null;
            email: string;
            role: string;
        }>;
        candidateName: string;
        candidateEmail: string;
    }>;
    cancel(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        tenantId: string;
        status: string;
        deletedAt: Date | null;
        stage: string;
        notes: string | null;
        candidateId: string;
        interviewerIds: string[];
        durationMins: number;
        meetingLink: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        bulkMode: import("@prisma/client").$Enums.BulkMode | null;
        bulkBatchId: string | null;
        candidateIds: string[];
    }>;
    sync(req: any, id: string): {
        message: string;
    };
    complete(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        tenantId: string;
        status: string;
        deletedAt: Date | null;
        stage: string;
        notes: string | null;
        candidateId: string;
        interviewerIds: string[];
        durationMins: number;
        meetingLink: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        bulkMode: import("@prisma/client").$Enums.BulkMode | null;
        bulkBatchId: string | null;
        candidateIds: string[];
    }>;
    listNotes(req: any, id: string): Promise<{
        data: {
            author: {
                id: string;
                name: string | null;
                email: string;
            };
            authorId: string;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            totalPages: number;
        };
    }>;
    addNote(req: any, id: string, dto: CreateInterviewNoteDto): Promise<{
        author: {
            id: string;
            name: string | null;
            email: string;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        authorId: string;
        interviewId: string;
    }>;
    updateNote(req: any, noteId: string, dto: UpdateInterviewNoteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        authorId: string;
        interviewId: string;
    }>;
    deleteNote(req: any, noteId: string): Promise<{
        success: boolean;
    }>;
    getTimeline(req: any, id: string): Promise<{
        data: {
            type: "note" | "feedback" | "activity";
            id: string;
            createdAt: Date;
            author?: {
                id: string;
                name: string | null;
                email: string;
            } | undefined;
            content?: string;
            rating?: number;
            action?: string;
        }[];
    }>;
}
