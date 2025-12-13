import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ZohoOAuthService } from './zoho.oauth';

@Injectable()
export class ZohoApiService {
    private readonly baseUrl = 'https://www.zohoapis.com/crm/v2';
    private readonly maxRetries = 3;
    private readonly retryDelay = 1000; // Base delay in ms

    constructor(private zohoOAuth: ZohoOAuthService) { }

    /**
     * Create an axios instance with auth headers
     */
    private async createClient(tenantId: string): Promise<AxiosInstance> {
        const accessToken = await this.zohoOAuth.getValidToken(tenantId);

        return axios.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Retry logic with exponential backoff
     */
    private async retryWithBackoff<T>(
        fn: () => Promise<T>,
        retries = this.maxRetries,
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) {
                throw error;
            }

            // Don't retry on 4xx errors (except 429 rate limit)
            if (error.response?.status >= 400 && error.response?.status < 500) {
                if (error.response.status !== 429) {
                    throw error;
                }
            }

            const delay = this.retryDelay * Math.pow(2, this.maxRetries - retries);
            const jitter = Math.random() * 1000;

            await new Promise((resolve) => setTimeout(resolve, delay + jitter));

            return this.retryWithBackoff(fn, retries - 1);
        }
    }

    /**
     * Get contacts from Zoho CRM
     */
    async getContacts(
        tenantId: string,
        page = 1,
        perPage = 200,
    ): Promise<any[]> {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.get('/Contacts', {
                params: {
                    page,
                    per_page: perPage,
                },
            });

            return response.data.data || [];
        });
    }

    /**
     * Get contacts modified since a specific date
     */
    async getContactsSince(
        tenantId: string,
        since: Date,
    ): Promise<any[]> {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.get('/Contacts', {
                params: {
                    modified_since: since.toISOString(),
                },
            });

            return response.data.data || [];
        });
    }

    /**
     * Create a new contact in Zoho CRM
     */
    async createContact(
        tenantId: string,
        contactData: Record<string, any>,
    ): Promise<any> {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.post('/Contacts', {
                data: [contactData],
            });

            if (response.data.data && response.data.data[0]) {
                return response.data.data[0];
            }

            throw new Error('Failed to create contact');
        });
    }

    /**
     * Update an existing contact in Zoho CRM
     */
    async updateContact(
        tenantId: string,
        contactId: string,
        contactData: Record<string, any>,
    ): Promise<any> {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.put(`/Contacts/${contactId}`, {
                data: [contactData],
            });

            if (response.data.data && response.data.data[0]) {
                return response.data.data[0];
            }

            throw new Error('Failed to update contact');
        });
    }

    /**
     * Search for a contact by email
     */
    async searchContactByEmail(
        tenantId: string,
        email: string,
    ): Promise<any | null> {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.get('/Contacts/search', {
                params: {
                    email,
                },
            });

            if (response.data.data && response.data.data.length > 0) {
                return response.data.data[0];
            }

            return null;
        });
    }

    /**
     * Get a specific contact by ID
     */
    async getContact(
        tenantId: string,
        contactId: string,
    ): Promise<any> {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.get(`/Contacts/${contactId}`);

            if (response.data.data && response.data.data.length > 0) {
                return response.data.data[0];
            }

            throw new Error('Contact not found');
        });
    }
}
