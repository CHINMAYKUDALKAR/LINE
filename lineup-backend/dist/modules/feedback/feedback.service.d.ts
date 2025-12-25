import { PrismaService } from '../../common/prisma.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class FeedbackService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    submitFeedback(tenantId: string, userId: string, dto: SubmitFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        comments: string | null;
        interviewId: string;
        interviewerId: string;
        rating: number;
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getInterviewFeedback(tenantId: string, interviewId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        comments: string | null;
        interviewId: string;
        interviewerId: string;
        rating: number;
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
