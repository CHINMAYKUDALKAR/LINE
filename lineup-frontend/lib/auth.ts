/**
 * Authentication Helper
 * Manages auth tokens for API requests
 */

const AUTH_TOKEN_KEY = 'accessToken';

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    return !!getAuthToken();
}

/**
 * For development/testing: Set a mock token
 * In production, this would come from your login flow
 */
export function setMockToken(): void {
    // This is a placeholder - replace with real token from your auth system
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token';
    setAuthToken(mockToken);
    console.warn('Using mock auth token - replace with real authentication');
}
