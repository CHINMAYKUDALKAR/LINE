export interface InterviewEventPayload {
    tenantId: string;
    interviewId: string;
    candidateId: string;
    interviewerIds: string[];
    interviewDate: Date;
    interviewTime: string;
    duration: number;
    stage: string;
    meetingLink?: string;
    notes?: string;
    candidateEmailSubject?: string;
    candidateEmailBody?: string;
    interviewerEmailSubject?: string;
    interviewerEmailBody?: string;
}
export interface InterviewRescheduledPayload extends InterviewEventPayload {
    previousDate: Date;
    newDate: Date;
}
export declare const INTERVIEW_EVENTS: {
    readonly CREATED: "interview.created";
    readonly RESCHEDULED: "interview.rescheduled";
    readonly CANCELLED: "interview.cancelled";
    readonly COMPLETED: "interview.completed";
    readonly REMINDER_24H: "interview.reminder.24h";
    readonly REMINDER_1H: "interview.reminder.1h";
};
export type InterviewEventType = typeof INTERVIEW_EVENTS[keyof typeof INTERVIEW_EVENTS];
