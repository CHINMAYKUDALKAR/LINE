import { OAuthTokenSet } from '../types/oauth.interface';
export declare function generateState(tenantId: string): string;
export declare function parseState(state: string): {
    tenantId: string;
    timestamp: number;
    nonce: string;
};
export declare function computeExpiry(expiresIn: number): number;
export declare function isExpired(tokenSet: OAuthTokenSet): boolean;
export declare function buildAuthUrl(baseUrl: string, params: Record<string, string>): string;
export declare function extractCodeFromCallback(callbackUrl: string): string | null;
