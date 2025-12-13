import { OutlookOAuthService } from './outlook.oauth';
export declare class OutlookCalendarApiService {
    private outlookOAuth;
    private readonly baseUrl;
    constructor(outlookOAuth: OutlookOAuthService);
    private createClient;
    createEvent(tenantId: string, event: any): Promise<any>;
    updateEvent(tenantId: string, eventId: string, event: any): Promise<any>;
    deleteEvent(tenantId: string, eventId: string): Promise<void>;
    getFreeBusy(tenantId: string, timeMin: Date, timeMax: Date, emails: string[]): Promise<any>;
}
