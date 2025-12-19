import { ProviderCapabilities, StandardCandidate, StandardInterview, StandardJob, SyncResult } from './standard-entities';
export interface IntegrationProvider {
    getCapabilities(): ProviderCapabilities;
    getAuthUrl(tenantId: string, state?: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<void>;
    pushCandidate?(tenantId: string, candidate: StandardCandidate): Promise<SyncResult>;
    pullCandidates?(tenantId: string, since?: Date): Promise<StandardCandidate[]>;
    pushInterview?(tenantId: string, interview: StandardInterview): Promise<SyncResult>;
    pullInterviews?(tenantId: string, since?: Date): Promise<StandardInterview[]>;
    createCalendarEvent?(tenantId: string, interview: any): Promise<any>;
    updateCalendarEvent?(tenantId: string, interview: any): Promise<any>;
    deleteCalendarEvent?(tenantId: string, interviewId: string): Promise<any>;
    pushJob?(tenantId: string, job: StandardJob): Promise<SyncResult>;
    pullJobs?(tenantId: string, since?: Date): Promise<StandardJob[]>;
    handleWebhook?(tenantId: string, event: any): Promise<void>;
}
