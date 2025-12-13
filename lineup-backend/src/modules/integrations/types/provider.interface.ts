export interface IntegrationProvider {
    /**
     * Generate OAuth authorization URL for the provider
     */
    getAuthUrl(tenantId: string, state?: string): Promise<string>;

    /**
     * Exchange authorization code for access/refresh tokens
     */
    exchangeCode(tenantId: string, code: string): Promise<void>;

    /**
     * Refresh expired access tokens
     */
    refreshTokens(tenantId: string): Promise<void>;

    /**
     * Push a candidate to the external CRM system
     */
    pushCandidate?(tenantId: string, candidate: any): Promise<any>;

    /**
     * Pull candidates from the external CRM system
     */
    pullCandidates?(tenantId: string, since?: Date): Promise<any[]>;

    /**
     * Create a calendar event for an interview
     */
    createCalendarEvent?(tenantId: string, interview: any): Promise<any>;

    /**
     * Update an existing calendar event
     */
    updateCalendarEvent?(tenantId: string, interview: any): Promise<any>;

    /**
     * Delete a calendar event
     */
    deleteCalendarEvent?(tenantId: string, interviewId: string): Promise<any>;

    /**
     * Handle incoming webhook events from the provider
     */
    handleWebhook?(tenantId: string, event: any): Promise<void>;
}
