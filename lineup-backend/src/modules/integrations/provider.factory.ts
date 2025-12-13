import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { IntegrationProvider } from './types/provider.interface';
import { ZohoProvider } from './providers/zoho/zoho.provider';
import { GoogleCalendarProvider } from './providers/google-calendar/google.provider';
import { OutlookCalendarProvider } from './providers/outlook-calendar/outlook.provider';
import { ZohoOAuthService } from './providers/zoho/zoho.oauth';
import { ZohoApiService } from './providers/zoho/zoho.api';
import { GoogleOAuthService } from './providers/google-calendar/google.oauth';
import { GoogleCalendarApiService } from './providers/google-calendar/google.calendar.api';
import { OutlookOAuthService } from './providers/outlook-calendar/outlook.oauth';
import { OutlookCalendarApiService } from './providers/outlook-calendar/outlook.api';

@Injectable()
export class ProviderFactory {
    constructor(
        private prisma: PrismaService,
        private zohoOAuth: ZohoOAuthService,
        private zohoApi: ZohoApiService,
        private googleOAuth: GoogleOAuthService,
        private googleCalendar: GoogleCalendarApiService,
        private outlookOAuth: OutlookOAuthService,
        private outlookCalendar: OutlookCalendarApiService,
    ) { }

    /**
     * Get provider instance by name
     */
    getProvider(provider: string): IntegrationProvider {
        switch (provider) {
            case 'zoho':
                return new ZohoProvider(this.prisma, this.zohoOAuth, this.zohoApi);

            case 'google_calendar':
                return new GoogleCalendarProvider(
                    this.prisma,
                    this.googleOAuth,
                    this.googleCalendar,
                );

            case 'outlook_calendar':
                return new OutlookCalendarProvider(
                    this.prisma,
                    this.outlookOAuth,
                    this.outlookCalendar,
                );

            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    /**
     * Get list of supported providers
     */
    getSupportedProviders(): string[] {
        return ['zoho', 'google_calendar', 'outlook_calendar'];
    }

    /**
     * Check if provider is supported
     */
    isSupported(provider: string): boolean {
        return this.getSupportedProviders().includes(provider);
    }
}
