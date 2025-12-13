import { PrismaService } from '../../common/prisma.service';
import { IntegrationProvider } from './types/provider.interface';
import { ZohoOAuthService } from './providers/zoho/zoho.oauth';
import { ZohoApiService } from './providers/zoho/zoho.api';
import { GoogleOAuthService } from './providers/google-calendar/google.oauth';
import { GoogleCalendarApiService } from './providers/google-calendar/google.calendar.api';
import { OutlookOAuthService } from './providers/outlook-calendar/outlook.oauth';
import { OutlookCalendarApiService } from './providers/outlook-calendar/outlook.api';
export declare class ProviderFactory {
    private prisma;
    private zohoOAuth;
    private zohoApi;
    private googleOAuth;
    private googleCalendar;
    private outlookOAuth;
    private outlookCalendar;
    constructor(prisma: PrismaService, zohoOAuth: ZohoOAuthService, zohoApi: ZohoApiService, googleOAuth: GoogleOAuthService, googleCalendar: GoogleCalendarApiService, outlookOAuth: OutlookOAuthService, outlookCalendar: OutlookCalendarApiService);
    getProvider(provider: string): IntegrationProvider;
    getSupportedProviders(): string[];
    isSupported(provider: string): boolean;
}
