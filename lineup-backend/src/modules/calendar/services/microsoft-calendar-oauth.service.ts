import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import axios from 'axios';

interface MicrosoftTokens {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
    expires_at?: number;
}

@Injectable()
export class MicrosoftCalendarOAuthService {
    private readonly logger = new Logger(MicrosoftCalendarOAuthService.name);
    private readonly clientId = process.env.MICROSOFT_CALENDAR_CLIENT_ID;
    private readonly clientSecret = process.env.MICROSOFT_CALENDAR_CLIENT_SECRET;
    private readonly tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    private readonly authUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`;
    private readonly tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    private readonly scopes = [
        'offline_access',
        'Calendars.Read',
        'User.Read',
    ].join(' ');

    constructor(private prisma: PrismaService) { }

    /**
     * Generate OAuth authorization URL for Microsoft Calendar
     */
    getAuthUrl(tenantId: string, userId: string, redirectUri: string): string {
        const state = Buffer.from(JSON.stringify({ tenantId, userId })).toString('base64');
        const params = new URLSearchParams({
            client_id: this.clientId || '',
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: this.scopes,
            response_mode: 'query',
            state,
        });
        return `${this.authUrl}?${params.toString()}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCode(
        tenantId: string,
        userId: string,
        code: string,
        redirectUri: string,
    ): Promise<{ success: boolean; accountId: string }> {
        const params = new URLSearchParams({
            code,
            client_id: this.clientId || '',
            client_secret: this.clientSecret || '',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            scope: this.scopes,
        });

        try {
            const res = await axios.post(this.tokenUrl, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!res.data.access_token) {
                throw new BadRequestException('Invalid authorization code');
            }

            const tokens: MicrosoftTokens = {
                ...res.data,
                expires_at: Date.now() + res.data.expires_in * 1000,
            };

            // Get user info from Microsoft Graph
            const userInfo = await axios.get('https://graph.microsoft.com/v1.0/me', {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });

            const account = await this.prisma.calendarSyncAccount.upsert({
                where: {
                    tenantId_userId_provider: { tenantId, userId, provider: 'microsoft' },
                },
                create: {
                    tenantId,
                    userId,
                    provider: 'microsoft',
                    providerAccountId: userInfo.data.id || userInfo.data.userPrincipalName,
                    credentials: tokens as any,
                    syncEnabled: true,
                },
                update: {
                    providerAccountId: userInfo.data.id || userInfo.data.userPrincipalName,
                    credentials: tokens as any,
                    syncEnabled: true,
                },
            });

            this.logger.log(`Connected Microsoft Calendar for user ${userId} in tenant ${tenantId}`);
            return { success: true, accountId: account.id };
        } catch (error) {
            this.logger.error(`Failed to exchange Microsoft OAuth code: ${error.message}`);
            throw new BadRequestException('Failed to connect Microsoft Calendar');
        }
    }

    /**
     * Refresh the access token
     */
    async refreshAccessToken(accountId: string): Promise<string> {
        const account = await this.prisma.calendarSyncAccount.findUnique({
            where: { id: accountId },
        });

        if (!account || account.provider !== 'microsoft') {
            throw new BadRequestException('Microsoft Calendar account not found');
        }

        const tokens = account.credentials as unknown as MicrosoftTokens;
        if (!tokens?.refresh_token) {
            throw new BadRequestException('No refresh token available');
        }

        const params = new URLSearchParams({
            client_id: this.clientId || '',
            client_secret: this.clientSecret || '',
            refresh_token: tokens.refresh_token,
            grant_type: 'refresh_token',
            scope: this.scopes,
        });

        try {
            const res = await axios.post(this.tokenUrl, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const newTokens: MicrosoftTokens = {
                ...tokens,
                access_token: res.data.access_token,
                expires_in: res.data.expires_in,
                expires_at: Date.now() + res.data.expires_in * 1000,
                // Microsoft may return a new refresh token
                ...(res.data.refresh_token && { refresh_token: res.data.refresh_token }),
            };

            await this.prisma.calendarSyncAccount.update({
                where: { id: accountId },
                data: { credentials: newTokens as any },
            });

            return newTokens.access_token;
        } catch (error) {
            this.logger.error(`Failed to refresh Microsoft token: ${error.message}`);
            throw new BadRequestException('Failed to refresh Microsoft Calendar token');
        }
    }

    /**
     * Get a valid access token (refreshing if needed)
     */
    async getValidAccessToken(accountId: string): Promise<string> {
        const account = await this.prisma.calendarSyncAccount.findUnique({
            where: { id: accountId },
        });

        if (!account || account.provider !== 'microsoft') {
            throw new BadRequestException('Microsoft Calendar account not found');
        }

        const tokens = account.credentials as unknown as MicrosoftTokens;
        if (!tokens?.access_token) {
            throw new BadRequestException('No access token available');
        }

        // Refresh if token expires within 5 minutes
        const expiresAt = tokens.expires_at || 0;
        if (expiresAt - Date.now() < 5 * 60 * 1000) {
            return this.refreshAccessToken(accountId);
        }

        return tokens.access_token;
    }

    /**
     * Disconnect Microsoft Calendar
     */
    async disconnect(tenantId: string, userId: string): Promise<void> {
        await this.prisma.calendarSyncAccount.deleteMany({
            where: { tenantId, userId, provider: 'microsoft' },
        });
        this.logger.log(`Disconnected Microsoft Calendar for user ${userId} in tenant ${tenantId}`);
    }
}
