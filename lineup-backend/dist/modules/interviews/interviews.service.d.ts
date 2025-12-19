import { PrismaService } from '../../common/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { ListInterviewsDto } from './dto/list-interviews.dto';
import { BulkScheduleDto, BulkScheduleResult } from './dto/bulk-schedule.dto';
import { Queue } from 'bullmq';
import { InterviewAutomationService } from './services/interview-automation.service';
import { RecycleBinService } from '../recycle-bin/recycle-bin.service';
import { IntegrationEventsService } from '../integrations/services/integration-events.service';
export declare class InterviewsService {
    private prisma;
    private reminderQueue;
    private syncQueue;
    private automationService;
    private recycleBinService;
    private integrationEvents;
    constructor(prisma: PrismaService, reminderQueue: Queue, syncQueue: Queue, automationService: InterviewAutomationService, recycleBinService: RecycleBinService, integrationEvents: IntegrationEventsService);
    create(tenantId: string, userId: string, dto: CreateInterviewDto): Promise<{
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
    reschedule(tenantId: string, userId: string, id: string, dto: RescheduleInterviewDto): Promise<{
        interview: {
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
    get(tenantId: string, id: string): Promise<{
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
    list(tenantId: string, dto: ListInterviewsDto): Promise<{
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
    detectConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string): Promise<{
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
    }[]>;
    checkConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string): Promise<void>;
    cancel(tenantId: string, userId: string, id: string): Promise<{
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
    complete(tenantId: string, userId: string, id: string): Promise<{
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
    delete(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    bulkSchedule(tenantId: string, userId: string, dto: BulkScheduleDto): Promise<BulkScheduleResult>;
    private enqueueReminders;
    private sanitizeContent;
    listNotes(tenantId: string, interviewId: string, page?: number, perPage?: number): Promise<{
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
    addNote(tenantId: string, interviewId: string, userId: string, content: string): Promise<{
        author: {
            id: string;
            name: string | null;
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
    updateNote(tenantId: string, noteId: string, userId: string, userRole: string, content: string): Promise<{
        id: string;
        tenantId: string;
        interviewId: string;
        authorId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteNote(tenantId: string, noteId: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    getTimeline(tenantId: string, interviewId: string): Promise<{
        data: {
            type: "note" | "feedback" | "activity";
            id: string;
            createdAt: Date;
            author?: {
                id: string;
                name: string | null;
                email: string;
            };
            content?: string;
            rating?: number;
            action?: string;
        }[];
    }>;
    private parseSort;
    private enrichWithInterviewers;
}
