"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockGoogleProvider = void 0;
class MockGoogleProvider {
    static generateAuthUrl(config) {
        const mockUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        mockUrl.searchParams.set('client_id', config.clientId || 'MOCK_CLIENT_ID');
        mockUrl.searchParams.set('redirect_uri', config.redirectUri || 'http://localhost:4000/auth/sso/callback');
        mockUrl.searchParams.set('response_type', 'code');
        mockUrl.searchParams.set('scope', (config.scopes || ['openid', 'email', 'profile']).join(' '));
        mockUrl.searchParams.set('state', config.state || 'mock-state');
        return mockUrl.toString() + '&mock=true';
    }
    static async exchangeCodeForToken(code, config) {
        console.log('[MOCK GOOGLE] Exchanging code for token (stub):', code?.substring(0, 20));
        return {
            access_token: 'mock-google-access-token-' + Date.now(),
            refresh_token: 'mock-google-refresh-token',
            expires_in: 3600,
            token_type: 'Bearer'
        };
    }
    static async fetchUserInfo(accessToken) {
        console.log('[MOCK GOOGLE] Fetching user info (stub) with token:', accessToken?.substring(0, 30));
        return {
            email: 'user@workspace.example.com',
            name: 'Jane Smith',
            picture: 'https://via.placeholder.com/96',
            sub: 'google-user-id-123456789'
        };
    }
    static async validateToken(token) {
        console.log('[MOCK GOOGLE] Validating token (stub)');
        return { valid: true, email: 'user@workspace.example.com' };
    }
}
exports.MockGoogleProvider = MockGoogleProvider;
//# sourceMappingURL=mock-google.provider.js.map