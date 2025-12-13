export declare const COMMUNICATION_QUEUES: {
    readonly EMAIL: "email-queue";
    readonly WHATSAPP: "whatsapp-queue";
    readonly SMS: "sms-queue";
    readonly AUTOMATION: "automation-queue";
    readonly SCHEDULER: "scheduler-queue";
    readonly DLQ: "communication-dlq";
};
export declare const QUEUE_RETRY_CONFIG: {
    attempts: number;
    backoff: {
        type: "exponential";
        delay: number;
    };
};
export interface MessageJobData {
    messageLogId: string;
    tenantId: string;
    channel: 'EMAIL' | 'WHATSAPP' | 'SMS';
    recipientEmail?: string;
    recipientPhone?: string;
    subject?: string;
    body: string;
    templateId?: string;
    context?: Record<string, any>;
}
export interface AutomationJobData {
    tenantId: string;
    trigger: string;
    entityId: string;
    entityType: 'INTERVIEW' | 'CANDIDATE' | 'FEEDBACK';
    data: Record<string, any>;
}
export interface ReceiptJobData {
    provider: 'whatsapp' | 'ses' | 'twilio';
    externalId: string;
    status: 'delivered' | 'read' | 'failed' | 'bounced';
    timestamp: string;
    metadata?: Record<string, any>;
}
