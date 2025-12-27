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
    private readonly logger;
    private static readonly ALLOWED_STATUS_TRANSITIONS;
    constructor(prisma: PrismaService, reminderQueue: Queue, syncQueue: Queue, automationService: InterviewAutomationService, recycleBinService: RecycleBinService, integrationEvents: IntegrationEventsService);
    private validateStatusTransition;
    create(tenantId: string, userId: string, dto: CreateInterviewDto): Promise<{
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
    reschedule(tenantId: string, userId: string, id: string, dto: RescheduleInterviewDto): Promise<{
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
    get(tenantId: string, id: string): Promise<{
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
    list(tenantId: string, dto: ListInterviewsDto): Promise<{
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
    detectConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string): Promise<{
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
    }[]>;
    checkConflicts(tenantId: string, interviewerIds: string[], start: Date, end: Date, excludeId?: string): Promise<void>;
    checkCandidateHasActiveInterview(tenantId: string, candidateId: string, excludeInterviewId?: string): Promise<void>;
    cancel(tenantId: string, userId: string, id: string): Promise<{
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
    complete(tenantId: string, userId: string, id: string): Promise<{
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
    delete(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    bulkSchedule(tenantId: string, userId: string, dto: BulkScheduleDto): Promise<BulkScheduleResult>;
    private handleGroupMode;
    private handleSequentialMode;
    private mapLegacyStrategyToMode;
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
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        authorId: string;
        interviewId: string;
    }>;
    updateNote(tenantId: string, noteId: string, userId: string, userRole: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        content: string;
        authorId: string;
        interviewId: string;
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
