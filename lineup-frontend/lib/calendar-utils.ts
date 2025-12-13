import { CalendarEvent } from '@/types/calendar';
import { InterviewSlot, SlotParticipant } from '@/lib/api/calendar';

/**
 * Transform an InterviewSlot from the API to the CalendarEvent format
 * used by the existing calendar components
 */
export function slotToCalendarEvent(slot: InterviewSlot): CalendarEvent {
    // Extract participant info
    const userParticipant = slot.participants.find(p => p.type === 'user');
    const candidateParticipant = slot.participants.find(p => p.type === 'candidate');

    // Calculate duration in minutes
    const startTime = new Date(slot.startAt);
    const endTime = new Date(slot.endAt);
    const durationMins = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Generate initials from name
    const getInitials = (name?: string) => {
        if (!name) return 'UN';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Map slot status to interview status
    const getInterviewStatus = (status: string): CalendarEvent['status'] => {
        switch (status) {
            case 'AVAILABLE':
                return 'scheduled';
            case 'BOOKED':
                return 'scheduled';
            case 'CANCELLED':
                return 'cancelled';
            case 'EXPIRED':
                return 'cancelled';
            default:
                return 'scheduled';
        }
    };

    // Extract stage from metadata or default
    const stage = (slot.metadata as any)?.stage || 'screening';

    return {
        id: slot.id,
        candidateId: candidateParticipant?.id || '',
        candidateName: candidateParticipant?.name || 'Available Slot',
        interviewerId: userParticipant?.id || slot.organizerId || '',
        interviewerName: userParticipant?.name || 'Unknown',
        interviewerInitials: getInitials(userParticipant?.name),
        role: (slot.metadata as any)?.role || 'Interview',
        stage: stage as CalendarEvent['stage'],
        status: getInterviewStatus(slot.status),
        startTime: slot.startAt,
        endTime: slot.endAt,
        duration: durationMins,
        mode: (slot.metadata as any)?.mode || 'video',
        meetingLink: (slot.metadata as any)?.meetingLink,
        location: (slot.metadata as any)?.location,
        tenantId: slot.tenantId,
    };
}

/**
 * Transform multiple slots to calendar events
 */
export function slotsToCalendarEvents(slots: InterviewSlot[]): CalendarEvent[] {
    return slots.map(slotToCalendarEvent);
}

/**
 * Calculate date range for a calendar view
 */
export function getCalendarDateRange(
    currentDate: Date,
    view: 'month' | 'week' | 'day'
): { start: Date; end: Date } {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'day') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
        // Start from Sunday of the week
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    } else if (view === 'month') {
        // Start from 1st of the month
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        // End at last day of month
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
    }

    return { start, end };
}
