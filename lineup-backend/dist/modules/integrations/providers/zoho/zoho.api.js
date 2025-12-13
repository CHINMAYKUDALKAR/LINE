"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const zoho_oauth_1 = require("./zoho.oauth");
let ZohoApiService = class ZohoApiService {
    zohoOAuth;
    baseUrl = 'https://www.zohoapis.com/crm/v2';
    maxRetries = 3;
    retryDelay = 1000;
    constructor(zohoOAuth) {
        this.zohoOAuth = zohoOAuth;
    }
    async createClient(tenantId) {
        const accessToken = await this.zohoOAuth.getValidToken(tenantId);
        return axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async retryWithBackoff(fn, retries = this.maxRetries) {
        try {
            return await fn();
        }
        catch (error) {
            if (retries === 0) {
                throw error;
            }
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
    async getContacts(tenantId, page = 1, perPage = 200) {
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
    async getContactsSince(tenantId, since) {
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
    async createContact(tenantId, contactData) {
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
    async updateContact(tenantId, contactId, contactData) {
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
    async searchContactByEmail(tenantId, email) {
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
    async getContact(tenantId, contactId) {
        return this.retryWithBackoff(async () => {
            const client = await this.createClient(tenantId);
            const response = await client.get(`/Contacts/${contactId}`);
            if (response.data.data && response.data.data.length > 0) {
                return response.data.data[0];
            }
            throw new Error('Contact not found');
        });
    }
};
exports.ZohoApiService = ZohoApiService;
exports.ZohoApiService = ZohoApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zoho_oauth_1.ZohoOAuthService])
], ZohoApiService);
//# sourceMappingURL=zoho.api.js.map