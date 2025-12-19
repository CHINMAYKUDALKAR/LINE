import { PrismaService } from '../../common/prisma.service';
import { Queue } from 'bullmq';
import { ProviderFactory } from './provider.factory';
import { MappingConfig } from './types/mapping.interface';
import { AuditService } from '../audit/audit.service';
export declare class IntegrationsService {
    private prisma;
    private providerFactory;
    private auditService;
    private syncQueue;
    constructor(prisma: PrismaService, providerFactory: ProviderFactory, auditService: AuditService, syncQueue: Queue);
    listIntegrations(tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        provider: string;
        lastSyncedAt: Date | null;
        lastError: string | null;
    }[]>;
    getIntegration(tenantId: string, provider: string): Promise<{
        id: string;
        settings: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        provider: string;
        lastSyncedAt: Date | null;
        lastError: string | null;
    }>;
    connect(tenantId: string, provider: string, userId: string): Promise<{
        authUrl: string;
        provider: string;
    }>;
    callback(provider: string, code: string, state: string, userId: string): Promise<{
        success: boolean;
        provider: string;
    }>;
    updateMapping(tenantId: string, provider: string, mappingDto: any, userId: string): Promise<{
        success: boolean;
        mapping: MappingConfig;
    }>;
    syncNow(tenantId: string, provider: string, userId: string, since?: Date): Promise<{
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
}
