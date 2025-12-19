import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { ProviderCapabilities } from '../../types/standard-entities';
import { GoogleOAuthService } from './google.oauth';
import { GoogleCalendarApiService } from './google.calendar.api';
export declare class GoogleCalendarProvider implements IntegrationProvider {
    private prisma;
    private googleOAuth;
    private googleCalendar;
    constructor(prisma: PrismaService, googleOAuth: GoogleOAuthService, googleCalendar: GoogleCalendarApiService);
    getCapabilities(): ProviderCapabilities;
    getAuthUrl(tenantId: string, state?: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<void>;
    createCalendarEvent(tenantId: string, interview: any): Promise<any>;
    updateCalendarEvent(tenantId: string, interview: any): Promise<any>;
    deleteCalendarEvent(tenantId: string, interviewId: string): Promise<any>;
    handleWebhook(tenantId: string, event: any): Promise<void>;
}
