
import { getAuthToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public data?: any,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined | null>;
    _retry?: boolean; // Used for refresh token retry
}

// Get active tenant ID from localStorage
function getActiveTenantId(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('activeTenantId');
    }
    return null;
}

// Attempt to refresh the access token
async function attemptTokenRefresh(): Promise<string | null> {
    try {
        const response = await fetch(`${API_BASE.replace('/api/v1', '')}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.activeTenantId) {
                localStorage.setItem('activeTenantId', data.activeTenantId);
            }
            return data.accessToken;
        }
        return null;
    } catch {
        return null;
    }
}

async function request<T>(
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    const token = getAuthToken();
    const tenantId = getActiveTenantId();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Add tenant ID header for multi-tenant context
    if (tenantId) {
        headers["X-Tenant-Id"] = tenantId;
    }

    let url = `${API_BASE}${endpoint}`;
    if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // For HTTPOnly cookies
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && !options._retry) {
        const newToken = await attemptTokenRefresh();
        if (newToken) {
            // Retry with new token
            return request<T>(endpoint, {
                ...options,
                _retry: true,
                headers: {
                    ...options.headers as Record<string, string>,
                    "Authorization": `Bearer ${newToken}`,
                },
            });
        }

        // Refresh failed - redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('activeTenantId');
            window.location.href = '/login';
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorData.message || `Request failed with status ${response.status}`,
            errorData,
        );
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : (null as unknown as T);
}

export const client = {
    get: <T>(endpoint: string, options: RequestOptions = {}) =>
        request<T>(endpoint, { ...options, method: "GET" }),

    post: <T>(endpoint: string, body?: any, options: RequestOptions = {}) =>
        request<T>(endpoint, {
            ...options,
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(endpoint: string, body?: any, options: RequestOptions = {}) =>
        request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        }),

    patch: <T>(endpoint: string, body?: any, options: RequestOptions = {}) =>
        request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string, options: RequestOptions = {}) =>
        request<T>(endpoint, { ...options, method: "DELETE" }),
};
