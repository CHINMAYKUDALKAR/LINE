import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
export declare class FeedbackController {
    private svc;
    constructor(svc: FeedbackService);
    submit(req: any, dto: SubmitFeedbackDto): Promise<{
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
    getForInterview(req: any, id: string): Promise<{
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
