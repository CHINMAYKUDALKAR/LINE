import { PrismaService } from '../../common/prisma.service';
import { Queue } from 'bullmq';
import { ProviderFactory } from './provider.factory';
import { MappingConfig } from './types/mapping.interface';
import { AuditService } from '../audit/audit.service';
import { UpdateMappingDto } from './dto/mapping.dto';
import { ZohoApiService } from './providers/zoho/zoho.api';
export declare class IntegrationsService {
    private prisma;
    private providerFactory;
    private auditService;
    private zohoApi;
    private syncQueue;
    private readonly logger;
    private syncRateLimiter;
    constructor(prisma: PrismaService, providerFactory: ProviderFactory, auditService: AuditService, zohoApi: ZohoApiService, syncQueue: Queue);
    listIntegrations(tenantId: string): Promise<{
        config: any;
        settings: undefined;
        id: string;
        provider: string;
        status: string | null;
        lastSyncedAt: Date | null;
        lastError: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getIntegration(tenantId: string, provider: string): Promise<{
        id: string;
        provider: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        status: string | null;
        lastSyncedAt: Date | null;
        lastError: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    connect(tenantId: string, provider: string, userId: string): Promise<{
        authUrl: string;
        provider: string;
    }>;
    callback(provider: string, code: string, state: string, userId: string): Promise<{
        success: boolean;
        provider: string;
    }>;
    updateMapping(tenantId: string, provider: string, mappingDto: UpdateMappingDto, userId: string): Promise<{
        success: boolean;
        mapping: MappingConfig;
    }>;
    updateConfig(tenantId: string, provider: string, config: any): Promise<{
        success: boolean;
        config: any;
    }>;
    syncNow(tenantId: string, provider: string, userId: string, since?: Date, module?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    handleWebhook(provider: string, payload: any): Promise<{
        success: boolean;
    }>;
    disconnect(tenantId: string, provider: string, userId: string): Promise<{
        success: boolean;
    }>;
    private extractTenantFromWebhook;
    getWebhookEvents(tenantId: string, provider: string, limit?: number): Promise<{
        events: {
            id: string;
            integrationId: string;
            eventType: string;
            status: string;
            payload: {
                recordId: string;
            };
            attempts: number;
            createdAt: Date;
            processedAt: Date;
        }[];
    }>;
    getMetrics(tenantId: string, provider: string): Promise<{
        integrationId: string;
        period: string;
        totalSyncs: number;
        successfulSyncs: number;
        failedSyncs: number;
        successRate: number;
        avgLatencyMs: number;
        recordsProcessed: number;
        queuedJobs: number;
        lastError: string | null;
    } | null>;
    getFieldSchemas(tenantId: string, provider: string): Promise<{
        sourceFields: {
            name: string;
            type: string;
            label: string;
            required: boolean;
        }[];
        targetFields: {
            name: string;
            type: string;
            label: string;
            required: boolean;
        }[];
        mappings: any;
    }>;
    getIntegrationStatus(tenantId: string, provider: string): Promise<{
        connected: boolean;
        provider: string;
        lastSyncAt: Date | null;
        lastError: string | null;
        capabilities: {
            candidateSync: string;
            jobSync: string;
            interviewSync: string;
            supportsWebhooks: boolean;
        };
        stats: {
            total: number;
            success: number;
            failed: number;
            pending: number;
            successRate: number;
        };
    }>;
    getSyncLogs(tenantId: string, provider: string, limit?: number, status?: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.SyncLogStatus;
        createdAt: Date;
        eventType: string;
        direction: import("@prisma/client").$Enums.SyncDirection;
        entityType: string;
        entityId: string | null;
        externalId: string | null;
        errorMessage: string | null;
        retryCount: number;
        completedAt: Date | null;
    }[]>;
    getFailureSummary(tenantId: string, provider: string): Promise<{
        recentErrors: {
            count: number;
            lastOccurred: Date;
            message: string;
        }[];
        totalFailures24h: number;
    }>;
    testZohoConnection(tenantId: string): Promise<{
        success: boolean;
        message: any;
    }>;
    getZohoContacts(tenantId: string, page?: number, perPage?: number): Promise<{
        success: boolean;
        data: any[];
        pagination: {
            page: number;
            perPage: number;
            total: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data: never[];
        pagination?: undefined;
    }>;
    getZohoLeads(tenantId: string, page?: number, perPage?: number): Promise<{
        success: boolean;
        message: string;
        data: never[];
        pagination: {
            page: number;
            perPage: number;
            total: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data: never[];
        message?: undefined;
        pagination?: undefined;
    }>;
}
