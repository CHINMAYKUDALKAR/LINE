import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../common/prisma.service';

/**
 * Salesforce OAuth Service
 * Handles OAuth2 flow for Salesforce integration
 * 
 * Required environment variables:
 * - SALESFORCE_CLIENT_ID
 * - SALESFORCE_CLIENT_SECRET
 * - SALESFORCE_REDIRECT_URI
 */
@Injectable()
export class SalesforceOAuthService {
    private readonly logger = new Logger(SalesforceOAuthService.name);
    private readonly loginUrl = 'https://login.salesforce.com';

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) { }

    /**
     * Get OAuth authorization URL
     */
    async getAuthUrl(tenantId: string): Promise<string> {
        const clientId = this.configService.get<string>('SALESFORCE_CLIENT_ID');
        const redirectUri = this.configService.get<string>('SALESFORCE_REDIRECT_URI');

        const state = Buffer.from(JSON.stringify({
            tenantId,
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(7),
        })).toString('base64url');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId || '',
            redirect_uri: redirectUri || '',
            state,
            scope: 'api refresh_token',
        });

        return `${this.loginUrl}/services/oauth2/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCode(tenantId: string, code: string): Promise<void> {
        const clientId = this.configService.get<string>('SALESFORCE_CLIENT_ID');
        const clientSecret = this.configService.get<string>('SALESFORCE_CLIENT_SECRET');
        const redirectUri = this.configService.get<string>('SALESFORCE_REDIRECT_URI');

        this.logger.log(`Exchanging code for Salesforce tokens for tenant ${tenantId}`);

        // TODO: Implement actual token exchange when API keys are provided
        // const response = await fetch(`${this.loginUrl}/services/oauth2/token`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //     body: new URLSearchParams({
        //         grant_type: 'authorization_code',
        //         client_id: clientId,
        //         client_secret: clientSecret,
        //         redirect_uri: redirectUri,
        //         code,
        //     }),
        // });

        // Store tokens in integration record
        await this.prisma.integration.upsert({
            where: {
                tenantId_provider: { tenantId, provider: 'salesforce' },
            },
            create: {
                tenantId,
                provider: 'salesforce',
                status: 'connected',
                tokens: {
                    // Placeholder - will be replaced with actual tokens
                    access_token: 'placeholder',
                    refresh_token: 'placeholder',
                    instance_url: 'https://na1.salesforce.com',
                    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                },
            },
            update: {
                status: 'connected',
                tokens: {
                    access_token: 'placeholder',
                    refresh_token: 'placeholder',
                    instance_url: 'https://na1.salesforce.com',
                    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                },
            },
        });
    }

    /**
     * Refresh access tokens
     */
    async refreshTokens(tenantId: string): Promise<void> {
        this.logger.log(`Refreshing Salesforce tokens for tenant ${tenantId}`);

        // TODO: Implement actual token refresh when API keys are provided
        // Get current tokens, refresh using refresh_token, update database
    }

    /**
     * Get current access token
     */
    async getAccessToken(tenantId: string): Promise<string> {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: { tenantId, provider: 'salesforce' },
            },
        });

        if (!integration?.tokens) {
            throw new Error('Salesforce not connected');
        }

        const tokens = integration.tokens as { access_token: string; expires_at: string };

        // Check if token is expired and refresh if needed
        if (new Date(tokens.expires_at) < new Date()) {
            await this.refreshTokens(tenantId);
            return this.getAccessToken(tenantId);
        }

        return tokens.access_token;
    }

    /**
     * Get instance URL for API calls
     */
    async getInstanceUrl(tenantId: string): Promise<string> {
        const integration = await this.prisma.integration.findUnique({
            where: {
                tenantId_provider: { tenantId, provider: 'salesforce' },
            },
        });

        const tokens = integration?.tokens as { instance_url?: string } | null;
        return tokens?.instance_url || 'https://na1.salesforce.com';
    }
}
