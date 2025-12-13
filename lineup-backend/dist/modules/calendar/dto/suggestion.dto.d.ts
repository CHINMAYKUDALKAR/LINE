export declare const MAX_PANEL_INTERVIEWERS: number;
export declare enum TimeOfDay {
    MORNING = "morning",
    AFTERNOON = "afternoon",
    EVENING = "evening",
    ANY = "any"
}
export declare class SlotPreferencesDto {
    preferredTimeOfDay?: TimeOfDay;
    preferredDays?: number[];
    avoidBackToBack?: boolean;
    minGapBetweenInterviewsMins?: number;
}
export declare class SuggestionQueryDto {
    userIds: string[];
    candidateId?: string;
    durationMins: number;
    startRange: string;
    endRange: string;
    maxSuggestions?: number;
    preferences?: SlotPreferencesDto;
    ruleId?: string;
}
export declare class SlotSuggestionDto {
    start: string;
    end: string;
    score: number;
    reasons: string[];
    userAvailability: Record<string, boolean>;
}
export declare class SuggestionResponseDto {
    suggestions: SlotSuggestionDto[];
    totalAvailableSlots: number;
    queryRange: {
        start: string;
        end: string;
    };
    processingTimeMs: number;
}
export declare class TeamAvailabilityQueryDto {
    userIds: string[];
    start: string;
    end: string;
    slotDurationMins?: number;
}
export declare class UserAvailabilityDto {
    userId: string;
    userName?: string;
    intervals: Array<{
        start: string;
        end: string;
    }>;
}
export declare class TeamAvailabilityResponseDto {
    userAvailability: UserAvailabilityDto[];
    commonSlots: Array<{
        start: string;
        end: string;
    }>;
    queryRange: {
        start: string;
        end: string;
    };
}
