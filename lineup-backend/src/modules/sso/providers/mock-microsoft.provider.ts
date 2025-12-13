/**
 * Mock Microsoft OAuth / Azure AD Provider
 * Stub implementation - no real OAuth token exchange
 */

export interface MicrosoftUserInfo {
    email: string;
    displayName: string;
    id: string;  // Microsoft user ID
    userPrincipalName?: string;
}

export interface MicrosoftTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    id_token?: string;
}

export class MockMicrosoftProvider {
    /**
     * Generate Microsoft OAuth authorization URL
     * In production, this would redirect to login.microsoftonline.com
     */
    static generateAuthUrl(config: {
        clientId?: string;
        redirectUri?: string;
        scopes?: string[];
        state?: string;
        tenantId?: string;  // Azure AD tenant (can be 'common', 'organizations', or specific tenant ID)
    }): string {
        const tenant = config.tenantId || 'common';
        const mockUrl = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
        mockUrl.searchParams.set('client_id', config.clientId || 'MOCK_MS_CLIENT_ID');
        mockUrl.searchParams.set('redirect_uri', config.redirectUri || 'http://localhost:4000/auth/sso/callback');
        mockUrl.searchParams.set('response_type', 'code');
        mockUrl.searchParams.set('scope', (config.scopes || ['openid', 'email', 'profile', 'User.Read']).join(' '));
        mockUrl.searchParams.set('state', config.state || 'mock-state');
        mockUrl.searchParams.set('response_mode', 'query');

        // Mark as mock URL
        return mockUrl.toString() + '&mock=true';
    }

    /**
     * Exchange authorization code for tokens (mock)
     * In production, this would call Microsoft's token endpoint
     */
    static async exchangeCodeForToken(
        code: string,
        config: { clientId?: string; clientSecret?: string; redirectUri?: string; tenantId?: string }
    ): Promise<MicrosoftTokenResponse> {
        console.log('[MOCK MICROSOFT] Exchanging code for token (stub):', code?.substring(0, 20));

        // Return mock token response
        return {
            access_token: 'mock-microsoft-access-token-' + Date.now(),
            refresh_token: 'mock-microsoft-refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
            id_token: 'mock-id-token'
        };
    }

    /**
     * Fetch user info from Microsoft Graph (mock)
     * In production, this would call graph.microsoft.com/v1.0/me
     */
    static async fetchUserInfo(accessToken: string): Promise<MicrosoftUserInfo> {
        console.log('[MOCK MICROSOFT] Fetching user info (stub) with token:', accessToken?.substring(0, 30));

        // Return mock user info
        return {
            email: 'employee@company.onmicrosoft.com',
            displayName: 'Bob Wilson',
            id: 'microsoft-user-id-abc123',
            userPrincipalName: 'employee@company.onmicrosoft.com'
        };
    }

    /**
     * Validate Microsoft token (mock)
     */
    static async validateToken(token: string): Promise<{ valid: boolean; email?: string }> {
        console.log('[MOCK MICROSOFT] Validating token (stub)');
        return { valid: true, email: 'employee@company.onmicrosoft.com' };
    }
}
