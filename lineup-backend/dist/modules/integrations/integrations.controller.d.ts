import { IntegrationsService } from './integrations.service';
import { ConnectDto } from './dto/connect.dto';
import { UpdateMappingDto } from './dto/mapping.dto';
import { TriggerSyncDto } from './dto/sync.dto';
export declare class IntegrationsController {
    private integrationsService;
    constructor(integrationsService: IntegrationsService);
    listIntegrations(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        provider: string;
        lastSyncedAt: Date | null;
        lastError: string | null;
    }[]>;
    getIntegration(req: any, provider: string): Promise<{
        id: string;
        settings: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        provider: string;
        lastSyncedAt: Date | null;
        lastError: string | null;
    }>;
    connect(req: any, connectDto: ConnectDto): Promise<{
        authUrl: string;
        provider: string;
    }>;
    callback(provider: string, code: string, state: string, req: any): Promise<{
        success: boolean;
        provider: string;
    }>;
    updateMapping(req: any, mappingDto: UpdateMappingDto): Promise<{
        success: boolean;
        mapping: import("./types/mapping.interface").MappingConfig;
    }>;
    triggerSync(req: any, syncDto: TriggerSyncDto): Promise<{
        success: boolean;
        message: string;
    }>;
    disconnect(req: any, body: {
        provider: string;
    }): Promise<{
        success: boolean;
    }>;
    getWebhooks(req: any, provider: string, limit?: string): Promise<{
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
    getMetrics(req: any, provider: string): Promise<{
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
    getFields(req: any, provider: string): Promise<{
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
