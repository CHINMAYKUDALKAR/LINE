import { ZohoOAuthService } from './zoho.oauth';
export declare class ZohoApiService {
    private zohoOAuth;
    private readonly logger;
    private readonly baseUrl;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(zohoOAuth: ZohoOAuthService);
    createContact(tenantId: string, contactData: Record<string, any>): Promise<any>;
    updateContact(tenantId: string, contactId: string, contactData: Record<string, any>): Promise<any>;
    searchContactByEmail(tenantId: string, email: string): Promise<any | null>;
    getContacts(tenantId: string, page?: number, perPage?: number): Promise<any[]>;
    getContactsSince(tenantId: string, since: Date): Promise<any[]>;
    createLead(tenantId: string, leadData: Record<string, any>): Promise<any>;
    updateLead(tenantId: string, leadId: string, leadData: Record<string, any>): Promise<any>;
    searchLeadByEmail(tenantId: string, email: string): Promise<any | null>;
    createActivity(tenantId: string, activityData: Record<string, any>): Promise<any>;
    updateActivity(tenantId: string, activityId: string, activityData: Record<string, any>): Promise<any>;
    getRecord(tenantId: string, module: string, recordId: string): Promise<any>;
    getUsers(tenantId: string): Promise<any[]>;
    getCurrentUser(tenantId: string): Promise<any>;
    getLeadStages(tenantId: string): Promise<any[]>;
    getContactStages(tenantId: string): Promise<any[]>;
    getLeads(tenantId: string, page?: number, perPage?: number): Promise<any[]>;
    testConnection(tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private createClient;
    private executeWithRetry;
    private classifyError;
    private extractResult;
}
