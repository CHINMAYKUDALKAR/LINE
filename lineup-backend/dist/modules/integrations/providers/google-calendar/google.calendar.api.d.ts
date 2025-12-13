import { GoogleOAuthService } from './google.oauth';
export declare class GoogleCalendarApiService {
    private googleOAuth;
    private readonly baseUrl;
    constructor(googleOAuth: GoogleOAuthService);
    private createClient;
    createEvent(tenantId: string, event: any): Promise<any>;
    updateEvent(tenantId: string, eventId: string, event: any): Promise<any>;
    deleteEvent(tenantId: string, eventId: string): Promise<void>;
    getFreeBusy(tenantId: string, timeMin: Date, timeMax: Date, calendars: string[]): Promise<any>;
}
