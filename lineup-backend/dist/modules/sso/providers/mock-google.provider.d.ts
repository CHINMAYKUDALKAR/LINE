export interface GoogleUserInfo {
    email: string;
    name: string;
    picture?: string;
    sub: string;
}
export interface GoogleTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}
export declare class MockGoogleProvider {
    static generateAuthUrl(config: {
        clientId?: string;
        redirectUri?: string;
        scopes?: string[];
        state?: string;
    }): string;
    static exchangeCodeForToken(code: string, config: {
        clientId?: string;
        clientSecret?: string;
        redirectUri?: string;
    }): Promise<GoogleTokenResponse>;
    static fetchUserInfo(accessToken: string): Promise<GoogleUserInfo>;
    static validateToken(token: string): Promise<{
        valid: boolean;
        email?: string;
    }>;
}
