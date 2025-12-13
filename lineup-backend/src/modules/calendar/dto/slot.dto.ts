import {
    IsString,
    IsOptional,
    IsArray,
    IsDateString,
    IsInt,
    Min,
    ValidateNested,
    IsObject,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// Slot participant structure
export class SlotParticipantDto {
    @IsString()
    type: 'user' | 'candidate';

    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    name?: string;
}

// Create a single slot directly
export class CreateSlotDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SlotParticipantDto)
    participants: SlotParticipantDto[];

    @IsDateString()
    startAt: string;

    @IsDateString()
    endAt: string;

    @IsString()
    timezone: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

// Generate multiple available slots
export class GenerateSlotsDto {
    @IsArray()
    @IsString({ each: true })
    userIds: string[]; // Interviewer IDs

    @IsDateString()
    startRange: string;

    @IsDateString()
    endRange: string;

    @IsInt()
    @Min(15)
    slotDurationMins: number;

    @IsOptional()
    @IsString()
    ruleId?: string; // Use specific scheduling rule

    @IsString()
    timezone: string;
}

// Book an existing slot
export class BookSlotDto {
    @IsOptional()
    @IsString()
    interviewId?: string; // Link to existing interview or create new

    @ValidateNested()
    @Type(() => SlotParticipantDto)
    candidate: SlotParticipantDto;

    @IsOptional()
    @IsString()
    candidateId?: string; // If linking to existing candidate

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

// Reschedule a booked slot
export class RescheduleSlotDto {
    @IsDateString()
    newStartAt: string;

    @IsDateString()
    newEndAt: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

// Query slots
export class SlotQueryDto {
    @IsOptional()
    @IsString()
    status?: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'EXPIRED';

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsDateString()
    start?: string;

    @IsOptional()
    @IsDateString()
    end?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    perPage?: number;
}
