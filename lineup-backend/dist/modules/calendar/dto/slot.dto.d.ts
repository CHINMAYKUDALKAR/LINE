export declare class SlotParticipantDto {
    type: 'user' | 'candidate';
    id: string;
    email?: string;
    phone?: string;
    name?: string;
}
export declare class CreateSlotDto {
    participants: SlotParticipantDto[];
    startAt: string;
    endAt: string;
    timezone: string;
    metadata?: Record<string, any>;
}
export declare class GenerateSlotsDto {
    userIds: string[];
    startRange: string;
    endRange: string;
    slotDurationMins: number;
    ruleId?: string;
    timezone: string;
}
export declare class BookSlotDto {
    interviewId?: string;
    candidate: SlotParticipantDto;
    candidateId?: string;
    metadata?: Record<string, any>;
}
export declare class RescheduleSlotDto {
    newStartAt: string;
    newEndAt: string;
    reason?: string;
}
export declare class SlotQueryDto {
    status?: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'EXPIRED';
    userId?: string;
    start?: string;
    end?: string;
    page?: number;
    perPage?: number;
}
