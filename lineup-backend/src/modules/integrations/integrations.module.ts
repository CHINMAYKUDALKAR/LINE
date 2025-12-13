import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from '../../common/prisma.service';
import { AuditModule } from '../audit/audit.module';

// Controllers
import { IntegrationsController } from './integrations.controller';
import { WebhookController } from './webhooks/webhook.controller';

// Services
import { IntegrationsService } from './integrations.service';
import { WebhookService } from './webhooks/webhook.service';
import { ProviderFactory } from './provider.factory';

// Zoho Provider
import { ZohoProvider } from './providers/zoho/zoho.provider';
import { ZohoOAuthService } from './providers/zoho/zoho.oauth';
import { ZohoApiService } from './providers/zoho/zoho.api';

// Google Calendar Provider
import { GoogleCalendarProvider } from './providers/google-calendar/google.provider';
import { GoogleOAuthService } from './providers/google-calendar/google.oauth';
import { GoogleCalendarApiService } from './providers/google-calendar/google.calendar.api';

// Outlook Calendar Provider
import { OutlookCalendarProvider } from './providers/outlook-calendar/outlook.provider';
import { OutlookOAuthService } from './providers/outlook-calendar/outlook.oauth';
import { OutlookCalendarApiService } from './providers/outlook-calendar/outlook.api';

// Processors
import { SyncProcessor } from './processors/sync.processor';
import { DlqProcessor } from './processors/dlq.processor';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: 'integration-sync' },
            { name: 'integration-dlq' },
        ),
        AuditModule,
    ],
    controllers: [IntegrationsController, WebhookController],
    providers: [
        PrismaService,
        IntegrationsService,
        WebhookService,
        ProviderFactory,
        // Providers
        ZohoProvider,
        ZohoOAuthService,
        ZohoApiService,
        GoogleCalendarProvider,
        GoogleOAuthService,
        GoogleCalendarApiService,
        OutlookCalendarProvider,
        OutlookOAuthService,
        OutlookCalendarApiService,
        // Processors
        SyncProcessor,
        DlqProcessor,
    ],
    exports: [IntegrationsService, ProviderFactory],
})
export class IntegrationsModule { }
