import { PrismaService } from '../../common/prisma.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class FeedbackService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    submitFeedback(tenantId: string, userId: string, dto: SubmitFeedbackDto): Promise<{
        id: string;
        tenantId: string;
        interviewId: string;
        interviewerId: string;
        rating: number;
        criteria: import(".prisma/client").Prisma.JsonValue | null;
        comments: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInterviewFeedback(tenantId: string, interviewId: string): Promise<{
        id: string;
        tenantId: string;
        interviewId: string;
        interviewerId: string;
        rating: number;
        criteria: import(".prisma/client").Prisma.JsonValue | null;
        comments: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
