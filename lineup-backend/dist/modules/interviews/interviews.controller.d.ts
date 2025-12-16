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
        tenantId: string;
        candidateId: string;
        interviewerIds: string[];
        date: Date;
        durationMins: number;
        stage: string;
        status: string;
        meetingLink: string | null;
        notes: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    bulkSchedule(req: any, dto: BulkScheduleDto): Promise<import("./dto/bulk-schedule.dto").BulkScheduleResult>;
    createReschedule(req: any, dto: RescheduleInterviewDto & {
        interviewId: string;
    }): Promise<{
        id: string;
        tenantId: string;
        candidateId: string;
        interviewerIds: string[];
        date: Date;
        durationMins: number;
        stage: string;
        status: string;
        meetingLink: string | null;
        notes: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    list(req: any, dto: ListInterviewsDto): Promise<{
        data: ({
            candidate: {
                name: string;
                email: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            candidateId: string;
            interviewerIds: string[];
            date: Date;
            durationMins: number;
            stage: string;
            status: string;
            meetingLink: string | null;
            notes: string | null;
            avgRating: number | null;
            hasFeedback: boolean;
            isNoShow: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
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
        tenantId: string;
        candidateId: string;
        interviewerIds: string[];
        date: Date;
        durationMins: number;
        stage: string;
        status: string;
        meetingLink: string | null;
        notes: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
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
        tenantId: string;
        candidateId: string;
        interviewerIds: string[];
        date: Date;
        durationMins: number;
        stage: string;
        status: string;
        meetingLink: string | null;
        notes: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    sync(req: any, id: string): {
        message: string;
    };
    complete(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        candidateId: string;
        interviewerIds: string[];
        date: Date;
        durationMins: number;
        stage: string;
        status: string;
        meetingLink: string | null;
        notes: string | null;
        avgRating: number | null;
        hasFeedback: boolean;
        isNoShow: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    listNotes(req: any, id: string): Promise<{
        data: {
            author: {
                name: string | null;
                id: string;
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
            name: string | null;
            id: string;
            email: string;
        };
        id: string;
        tenantId: string;
        interviewId: string;
        authorId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateNote(req: any, noteId: string, dto: UpdateInterviewNoteDto): Promise<{
        id: string;
        tenantId: string;
        interviewId: string;
        authorId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
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
