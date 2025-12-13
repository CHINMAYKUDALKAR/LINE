"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMicrosoftProvider = void 0;
class MockMicrosoftProvider {
    static generateAuthUrl(config) {
        const tenant = config.tenantId || 'common';
        const mockUrl = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
        mockUrl.searchParams.set('client_id', config.clientId || 'MOCK_MS_CLIENT_ID');
        mockUrl.searchParams.set('redirect_uri', config.redirectUri || 'http://localhost:4000/auth/sso/callback');
        mockUrl.searchParams.set('response_type', 'code');
        mockUrl.searchParams.set('scope', (config.scopes || ['openid', 'email', 'profile', 'User.Read']).join(' '));
        mockUrl.searchParams.set('state', config.state || 'mock-state');
        mockUrl.searchParams.set('response_mode', 'query');
        return mockUrl.toString() + '&mock=true';
    }
    static async exchangeCodeForToken(code, config) {
        console.log('[MOCK MICROSOFT] Exchanging code for token (stub):', code?.substring(0, 20));
        return {
            access_token: 'mock-microsoft-access-token-' + Date.now(),
            refresh_token: 'mock-microsoft-refresh-token',
            expires_in: 3600,
            token_type: 'Bearer',
            id_token: 'mock-id-token'
        };
    }
    static async fetchUserInfo(accessToken) {
        console.log('[MOCK MICROSOFT] Fetching user info (stub) with token:', accessToken?.substring(0, 30));
        return {
            email: 'employee@company.onmicrosoft.com',
            displayName: 'Bob Wilson',
            id: 'microsoft-user-id-abc123',
            userPrincipalName: 'employee@company.onmicrosoft.com'
        };
    }
    static async validateToken(token) {
        console.log('[MOCK MICROSOFT] Validating token (stub)');
        return { valid: true, email: 'employee@company.onmicrosoft.com' };
    }
}
exports.MockMicrosoftProvider = MockMicrosoftProvider;
//# sourceMappingURL=mock-microsoft.provider.js.map