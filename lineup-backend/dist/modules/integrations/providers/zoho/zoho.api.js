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
var ZohoApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const zoho_oauth_1 = require("./zoho.oauth");
let ZohoApiService = ZohoApiService_1 = class ZohoApiService {
    zohoOAuth;
    logger = new common_1.Logger(ZohoApiService_1.name);
    baseUrl = 'https://www.zohoapis.in/crm/v2';
    maxRetries = 3;
    retryDelay = 1000;
    constructor(zohoOAuth) {
        this.zohoOAuth = zohoOAuth;
    }
    async createContact(tenantId, contactData) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.post('/Contacts', {
                data: [contactData],
            });
            return this.extractResult(response.data, 'create');
        });
    }
    async updateContact(tenantId, contactId, contactData) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.put(`/Contacts/${contactId}`, {
                data: [contactData],
            });
            return this.extractResult(response.data, 'update');
        });
    }
    async searchContactByEmail(tenantId, email) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/Contacts/search', {
                params: { email },
            });
            return response.data?.data?.[0] || null;
        });
    }
    async getContacts(tenantId, page = 1, perPage = 200) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/Contacts', {
                params: { page, per_page: perPage },
            });
            return response.data?.data || [];
        });
    }
    async getContactsSince(tenantId, since) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/Contacts', {
                params: { modified_since: since.toISOString() },
            });
            return response.data?.data || [];
        });
    }
    async createLead(tenantId, leadData) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.post('/Leads', {
                data: [leadData],
            });
            return this.extractResult(response.data, 'create');
        });
    }
    async updateLead(tenantId, leadId, leadData) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.put(`/Leads/${leadId}`, {
                data: [leadData],
            });
            return this.extractResult(response.data, 'update');
        });
    }
    async searchLeadByEmail(tenantId, email) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/Leads/search', {
                params: { email },
            });
            return response.data?.data?.[0] || null;
        });
    }
    async createActivity(tenantId, activityData) {
        const module = activityData.Activity_Type === 'Call' ? 'Calls' : 'Events';
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.post(`/${module}`, {
                data: [activityData],
            });
            return this.extractResult(response.data, 'create');
        });
    }
    async updateActivity(tenantId, activityId, activityData) {
        const module = activityData.Activity_Type === 'Call' ? 'Calls' : 'Events';
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.put(`/${module}/${activityId}`, {
                data: [activityData],
            });
            return this.extractResult(response.data, 'update');
        });
    }
    async getRecord(tenantId, module, recordId) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get(`/${module}/${recordId}`);
            return response.data?.data?.[0] || null;
        });
    }
    async getUsers(tenantId) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/users', {
                params: { type: 'AllUsers' },
            });
            return response.data?.users || [];
        });
    }
    async getCurrentUser(tenantId) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/users', {
                params: { type: 'CurrentUser' },
            });
            return response.data?.users?.[0] || null;
        });
    }
    async getLeadStages(tenantId) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/settings/fields', {
                params: { module: 'Leads' },
            });
            const fields = response.data?.fields || [];
            const statusField = fields.find((f) => f.api_name === 'Lead_Status' || f.field_label === 'Lead Status');
            if (statusField?.pick_list_values) {
                return statusField.pick_list_values.map((v, index) => ({
                    id: v.id || `stage_${index}`,
                    name: v.display_value || v.actual_value,
                    order: index,
                }));
            }
            return [];
        });
    }
    async getContactStages(tenantId) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/settings/fields', {
                params: { module: 'Contacts' },
            });
            const fields = response.data?.fields || [];
            const statusField = fields.find((f) => f.api_name === 'Contact_Status' ||
                f.field_label === 'Status' ||
                f.api_name === 'Lead_Source');
            if (statusField?.pick_list_values) {
                return statusField.pick_list_values.map((v, index) => ({
                    id: v.id || `stage_${index}`,
                    name: v.display_value || v.actual_value,
                    order: index,
                }));
            }
            return [];
        });
    }
    async getLeads(tenantId, page = 1, perPage = 200) {
        return this.executeWithRetry(tenantId, async (client) => {
            const response = await client.get('/Leads', {
                params: { page, per_page: perPage },
            });
            return response.data?.data || [];
        });
    }
    async testConnection(tenantId) {
        try {
            const client = await this.createClient(tenantId);
            await client.get('/users', { params: { type: 'CurrentUser' } });
            return { success: true, message: 'Connected to Zoho CRM' };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to connect to Zoho CRM',
            };
        }
    }
    async createClient(tenantId) {
        const accessToken = await this.zohoOAuth.getValidToken(tenantId);
        return axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }
    async executeWithRetry(tenantId, operation, attempt = 1) {
        try {
            const client = await this.createClient(tenantId);
            return await operation(client);
        }
        catch (error) {
            const apiError = this.classifyError(error);
            this.logger.warn(`Zoho API error (attempt ${attempt}/${this.maxRetries}): ${apiError.message}`);
            if (apiError.type === 'permanent') {
                throw new Error(`Zoho API error: ${apiError.message}`);
            }
            if (apiError.type === 'auth' && attempt === 1) {
                this.logger.log('Token expired, refreshing...');
                await this.zohoOAuth.refreshTokens(tenantId);
                return this.executeWithRetry(tenantId, operation, attempt + 1);
            }
            if (attempt >= this.maxRetries) {
                throw new Error(`Zoho API failed after ${this.maxRetries} attempts: ${apiError.message}`);
            }
            const delay = this.retryDelay * Math.pow(2, attempt - 1);
            const jitter = Math.random() * 1000;
            const totalDelay = apiError.type === 'rate_limit'
                ? delay * 5 + jitter
                : delay + jitter;
            this.logger.log(`Retrying in ${Math.round(totalDelay)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, totalDelay));
            return this.executeWithRetry(tenantId, operation, attempt + 1);
        }
    }
    classifyError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            const status = axiosError.response?.status;
            const data = axiosError.response?.data;
            const zohoCode = data?.code;
            if (status === 429) {
                return {
                    type: 'rate_limit',
                    message: 'Rate limit exceeded',
                    statusCode: 429,
                };
            }
            if (status === 401 || zohoCode === 'INVALID_TOKEN') {
                return {
                    type: 'auth',
                    message: 'Authentication failed',
                    statusCode: 401,
                    zohoCode,
                };
            }
            if (status && status >= 400 && status < 500) {
                return {
                    type: 'permanent',
                    message: data?.message || `Client error: ${status}`,
                    statusCode: status,
                    zohoCode,
                };
            }
            if (status && status >= 500) {
                return {
                    type: 'transient',
                    message: `Server error: ${status}`,
                    statusCode: status,
                };
            }
            if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
                return {
                    type: 'transient',
                    message: 'Request timeout',
                };
            }
        }
        return {
            type: 'transient',
            message: error.message || 'Unknown error',
        };
    }
    extractResult(data, operation) {
        if (!data?.data?.[0]) {
            throw new Error(`Failed to ${operation}: No response data`);
        }
        const result = data.data[0];
        if (result.status === 'error') {
            throw new Error(result.message || `${operation} failed`);
        }
        return result;
    }
};
exports.ZohoApiService = ZohoApiService;
exports.ZohoApiService = ZohoApiService = ZohoApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zoho_oauth_1.ZohoOAuthService])
], ZohoApiService);
//# sourceMappingURL=zoho.api.js.map