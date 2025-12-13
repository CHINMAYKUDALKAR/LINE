import { Queue } from 'bullmq';
import { InterviewEventPayload } from '../events/interview-events';
import { AutomationTrigger } from '@prisma/client';
export declare class InterviewAutomationService {
    private automationQueue;
    private readonly logger;
    constructor(automationQueue: Queue);
    onInterviewCreated(payload: InterviewEventPayload): Promise<void>;
    onInterviewRescheduled(payload: InterviewEventPayload): Promise<void>;
    onInterviewCancelled(payload: InterviewEventPayload): Promise<void>;
    onInterviewCompleted(payload: InterviewEventPayload): Promise<void>;
    private scheduleReminderTriggers;
    private publishTrigger;
    runAutomationForInterviewTrigger(trigger: keyof typeof AutomationTrigger, interview: any): Promise<void>;
}
