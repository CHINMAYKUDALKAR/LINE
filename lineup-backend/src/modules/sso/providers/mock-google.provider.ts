/**
 * Mock Google OAuth Provider
 * Stub implementation - no real OAuth token exchange
 */

export interface GoogleUserInfo {
    email: string;
    name: string;
    picture?: string;
    sub: string;  // Google user ID
}

export interface GoogleTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}

export class MockGoogleProvider {
    /**
     * Generate Google OAuth authorization URL
     * In production, this would redirect to accounts.google.com
     */
    static generateAuthUrl(config: {
        clientId?: string;
        redirectUri?: string;
        scopes?: string[];
        state?: string;
    }): string {
        const mockUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        mockUrl.searchParams.set('client_id', config.clientId || 'MOCK_CLIENT_ID');
        mockUrl.searchParams.set('redirect_uri', config.redirectUri || 'http://localhost:4000/auth/sso/callback');
        mockUrl.searchParams.set('response_type', 'code');
        mockUrl.searchParams.set('scope', (config.scopes || ['openid', 'email', 'profile']).join(' '));
        mockUrl.searchParams.set('state', config.state || 'mock-state');

        // Mark as mock URL
        return mockUrl.toString() + '&mock=true';
    }

    /**
     * Exchange authorization code for tokens (mock)
     * In production, this would call Google's token endpoint
     */
    static async exchangeCodeForToken(
        code: string,
        config: { clientId?: string; clientSecret?: string; redirectUri?: string }
    ): Promise<GoogleTokenResponse> {
        console.log('[MOCK GOOGLE] Exchanging code for token (stub):', code?.substring(0, 20));

        // Return mock token response
        return {
            access_token: 'mock-google-access-token-' + Date.now(),
            refresh_token: 'mock-google-refresh-token',
            expires_in: 3600,
            token_type: 'Bearer'
        };
    }

    /**
     * Fetch user info from Google (mock)
     * In production, this would call googleapis.com/oauth2/v2/userinfo
     */
    static async fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
        console.log('[MOCK GOOGLE] Fetching user info (stub) with token:', accessToken?.substring(0, 30));

        // Return mock user info
        return {
            email: 'user@workspace.example.com',
            name: 'Jane Smith',
            picture: 'https://via.placeholder.com/96',
            sub: 'google-user-id-123456789'
        };
    }

    /**
     * Validate Google token (mock)
     */
    static async validateToken(token: string): Promise<{ valid: boolean; email?: string }> {
        console.log('[MOCK GOOGLE] Validating token (stub)');
        return { valid: true, email: 'user@workspace.example.com' };
    }
}
