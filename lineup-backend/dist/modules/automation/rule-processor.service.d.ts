import { PrismaService } from '../../common/prisma.service';
import { MessageService } from '../communication/services/message.service';
import { CandidatesService } from '../candidates/candidates.service';
export declare class RuleProcessor {
    private prisma;
    private messageService;
    private candidatesService;
    private readonly logger;
    constructor(prisma: PrismaService, messageService: MessageService, candidatesService: CandidatesService);
    handleFeedbackSubmitted(payload: {
        feedbackId: string;
        candidateId: string;
        tenantId: string;
        overallScore?: number;
    }): Promise<void>;
    handleStageChanged(payload: {
        candidateId: string;
        tenantId: string;
        stage: string;
        previousStage: string;
    }): Promise<void>;
    handleInterviewNoShow(payload: {
        interviewId: string;
        candidateId: string;
        tenantId: string;
    }): Promise<void>;
    private processRules;
    private evaluateConditions;
    private executeAction;
}
