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
}
