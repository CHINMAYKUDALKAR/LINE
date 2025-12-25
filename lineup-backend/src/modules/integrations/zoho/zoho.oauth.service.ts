import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import axios from 'axios';
import { decryptObject } from '../utils/crypto.util';

@Injectable()
export class ZohoOAuthService {
    private clientId = process.env.ZOHO_CLIENT_ID;
    private clientSecret = process.env.ZOHO_CLIENT_SECRET;
    private tokenUrl = 'https://accounts.zoho.in/oauth/v2/token'; // India region

    constructor(private prisma: PrismaService) { }

    getAuthUrl(tenantId: string, redirectUri: string) {
        return `https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${this.clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}&state=${tenantId}`;
    }

    async exchangeCode(tenantId: string, code: string, redirectUri: string) {
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('client_id', this.clientId || ''); // Handle undefined env
        params.append('client_secret', this.clientSecret || '');
        params.append('grant_type', 'authorization_code');

        const res = await axios.post(this.tokenUrl, params);
        if (!res.data.access_token) throw new BadRequestException('Invalid auth code');

        await this.prisma.integration.upsert({
            where: { tenantId_provider: { tenantId, provider: 'zoho' } },
            create: {
                tenantId,
                provider: 'zoho',
                tokens: res.data,
                status: 'active'
            },
            update: {
                tokens: res.data,
                status: 'active'
            }
        });

        return { success: true };
    }

    async refreshToken(tenantId: string) {
        const integ = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' }
        });
        // Type assertion for tokens as JsonValue doesn't have typed properties
        const tokens = integ?.tokens as any;
        if (!integ || !tokens?.refresh_token) throw new BadRequestException('No Zoho integration found');

        const params = new URLSearchParams();
        params.append('client_id', this.clientId || '');
        params.append('client_secret', this.clientSecret || '');
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', tokens.refresh_token);

        const res = await axios.post(this.tokenUrl, params);

        // Update tokens with new access token, keeping old refresh token if not provided
        const newTokens = { ...tokens, access_token: res.data.access_token };
        if (res.data.refresh_token) newTokens.refresh_token = res.data.refresh_token;

        await this.prisma.integration.update({
            where: { id: integ.id },
            data: { tokens: newTokens }
        });

        return newTokens.access_token;
    }

    async getAccessToken(tenantId: string): Promise<string> {
        const integ = await this.prisma.integration.findFirst({
            where: { tenantId, provider: 'zoho' }
        });

        if (!integ || !integ.tokens) {
            throw new BadRequestException('Zoho integration not configured');
        }

        const rawTokens = integ.tokens as any;

        // Handle both encrypted (from legacy provider) and plain JSON tokens
        let tokens: any;

        // Check if tokens are encrypted (string format) or plain JSON
        if (typeof rawTokens === 'string') {
            // Encrypted tokens from legacy provider - need to decrypt
            try {
                tokens = decryptObject(rawTokens);
                // Legacy format uses accessToken, not access_token
                if (tokens.accessToken) {
                    return tokens.accessToken;
                }
            } catch (e) {
                throw new BadRequestException('Failed to decrypt Zoho tokens');
            }
        } else {
            tokens = rawTokens;
        }

        // Support both legacy format (accessToken) and new format (access_token)
        const accessToken = tokens?.accessToken || tokens?.access_token;
        if (!accessToken) {
            throw new BadRequestException('Zoho access token not found');
        }

        return accessToken;
    }
}
