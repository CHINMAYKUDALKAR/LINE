export declare class CreateInterviewDto {
    candidateId: string;
    interviewerIds: string[];
    startAt: string;
    durationMins: number;
    stage?: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
    candidateEmailSubject?: string;
    candidateEmailBody?: string;
    interviewerEmailSubject?: string;
    interviewerEmailBody?: string;
}
