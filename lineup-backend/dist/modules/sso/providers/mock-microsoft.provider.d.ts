export interface MicrosoftUserInfo {
    email: string;
    displayName: string;
    id: string;
    userPrincipalName?: string;
}
export interface MicrosoftTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    id_token?: string;
}
export declare class MockMicrosoftProvider {
    static generateAuthUrl(config: {
        clientId?: string;
        redirectUri?: string;
        scopes?: string[];
        state?: string;
        tenantId?: string;
    }): string;
    static exchangeCodeForToken(code: string, config: {
        clientId?: string;
        clientSecret?: string;
        redirectUri?: string;
        tenantId?: string;
    }): Promise<MicrosoftTokenResponse>;
    static fetchUserInfo(accessToken: string): Promise<MicrosoftUserInfo>;
    static validateToken(token: string): Promise<{
        valid: boolean;
        email?: string;
    }>;
}
