export interface IntegrationProvider {
    getAuthUrl(tenantId: string, state?: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<void>;
    pushCandidate?(tenantId: string, candidate: any): Promise<any>;
    pullCandidates?(tenantId: string, since?: Date): Promise<any[]>;
    createCalendarEvent?(tenantId: string, interview: any): Promise<any>;
    updateCalendarEvent?(tenantId: string, interview: any): Promise<any>;
    deleteCalendarEvent?(tenantId: string, interviewId: string): Promise<any>;
    handleWebhook?(tenantId: string, event: any): Promise<void>;
}
