export declare class TransitionStageDto {
    newStage: string;
    reason?: string;
    allowOverride?: boolean;
}
export declare class RejectCandidateDto {
    reason: string;
}
export declare class StageTransitionResponseDto {
    success: boolean;
    candidateId: string;
    previousStage: string;
    newStage: string;
    transitionType: string;
    warnings?: string[];
}
export declare class StageHistoryEntryDto {
    id: string;
    previousStage: string;
    newStage: string;
    source: string;
    triggeredBy: string;
    actor?: {
        id: string;
        name: string | null;
        email: string;
    };
    reason?: string;
    createdAt: Date;
}
