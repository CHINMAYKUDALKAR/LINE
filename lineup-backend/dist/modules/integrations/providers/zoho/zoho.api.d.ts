import { ZohoOAuthService } from './zoho.oauth';
export declare class ZohoApiService {
    private zohoOAuth;
    private readonly baseUrl;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(zohoOAuth: ZohoOAuthService);
    private createClient;
    private retryWithBackoff;
    getContacts(tenantId: string, page?: number, perPage?: number): Promise<any[]>;
    getContactsSince(tenantId: string, since: Date): Promise<any[]>;
    createContact(tenantId: string, contactData: Record<string, any>): Promise<any>;
    updateContact(tenantId: string, contactId: string, contactData: Record<string, any>): Promise<any>;
    searchContactByEmail(tenantId: string, email: string): Promise<any | null>;
    getContact(tenantId: string, contactId: string): Promise<any>;
}
