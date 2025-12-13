import { PrismaService } from '../../../../common/prisma.service';
import { IntegrationProvider } from '../../types/provider.interface';
import { OutlookOAuthService } from './outlook.oauth';
import { OutlookCalendarApiService } from './outlook.api';
export declare class OutlookCalendarProvider implements IntegrationProvider {
    private prisma;
    private outlookOAuth;
    private outlookCalendar;
    constructor(prisma: PrismaService, outlookOAuth: OutlookOAuthService, outlookCalendar: OutlookCalendarApiService);
    getAuthUrl(tenantId: string, state?: string): Promise<string>;
    exchangeCode(tenantId: string, code: string): Promise<void>;
    refreshTokens(tenantId: string): Promise<void>;
    createCalendarEvent(tenantId: string, interview: any): Promise<any>;
    updateCalendarEvent(tenantId: string, interview: any): Promise<any>;
    deleteCalendarEvent(tenantId: string, interviewId: string): Promise<any>;
    handleWebhook(tenantId: string, event: any): Promise<void>;
}
