import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
export declare class FeedbackController {
    private svc;
    constructor(svc: FeedbackService);
    submit(req: any, dto: SubmitFeedbackDto): Promise<{
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
    getForInterview(req: any, id: string): Promise<{
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
