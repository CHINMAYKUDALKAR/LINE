import { PrismaService } from '../../../common/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export type TransitionSource = 'SYSTEM' | 'USER';
export type TransitionTrigger = 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'INTERVIEW_CANCELLED' | 'BULK_SCHEDULE' | 'MANUAL' | 'REJECTION' | 'OFFER_ACCEPTED' | 'IMPORT';
export interface StageTransitionRequest {
    candidateId: string;
    newStage: string;
    source: TransitionSource;
    triggeredBy: TransitionTrigger | string;
    actorId?: string;
    reason?: string;
    allowOverride?: boolean;
}
export interface StageTransitionResult {
    success: boolean;
    candidateId: string;
    previousStage: string;
    newStage: string;
    transitionType: 'FORWARD' | 'BACKWARD' | 'TERMINAL' | 'OVERRIDE' | 'SAME';
    warnings?: string[];
}
export declare class StageTransitionService {
    private prisma;
    private eventEmitter;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    transitionStage(tenantId: string, request: StageTransitionRequest): Promise<StageTransitionResult>;
    rejectCandidate(tenantId: string, candidateId: string, reason: string, actorId: string): Promise<StageTransitionResult>;
    isTerminalStage(tenantId: string, stageKey: string): Promise<boolean>;
    getStageOrder(tenantId: string, stageKey: string): Promise<number>;
    validateTransition(tenantId: string, fromStage: string, toStage: string): Promise<{
        valid: boolean;
        reason?: string;
    }>;
    getStageHistory(tenantId: string, candidateId: string): Promise<{
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
}
