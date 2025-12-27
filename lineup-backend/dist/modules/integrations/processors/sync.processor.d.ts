import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { ProviderFactory } from '../provider.factory';
import { AuditService } from '../../audit/audit.service';
import { IntegrationEventType, SyncEntityType } from '../types/standard-entities';
import { ZohoSyncService } from '../zoho/zoho.sync.service';
import { SalesforceSyncHandler } from '../providers/salesforce/salesforce.sync-handler';
import { HubspotSyncHandler } from '../providers/hubspot/hubspot.sync-handler';
import { WorkdaySyncHandler } from '../providers/workday/workday.sync-handler';
import { LeverSyncHandler } from '../providers/lever/lever.sync-handler';
import { GreenhouseSyncHandler } from '../providers/greenhouse/greenhouse.sync-handler';
interface SyncJobData {
    tenantId: string;
    provider: string;
    since?: string;
    triggeredBy?: string;
    module?: 'leads' | 'contacts' | 'both';
}
interface EventJobData {
    tenantId: string;
    provider: string;
    eventType: IntegrationEventType;
    entityType: SyncEntityType;
    entityId: string;
    data?: Record<string, unknown>;
    triggeredBy?: string;
    direction: 'OUTBOUND' | 'INBOUND';
}
export declare class SyncProcessor extends WorkerHost {
    private prisma;
    private providerFactory;
    private auditService;
    private zohoSyncService;
    private salesforceSyncHandler;
    private hubspotSyncHandler;
    private workdaySyncHandler;
    private leverSyncHandler;
    private greenhouseSyncHandler;
    private readonly logger;
    constructor(prisma: PrismaService, providerFactory: ProviderFactory, auditService: AuditService, zohoSyncService: ZohoSyncService, salesforceSyncHandler: SalesforceSyncHandler, hubspotSyncHandler: HubspotSyncHandler, workdaySyncHandler: WorkdaySyncHandler, leverSyncHandler: LeverSyncHandler, greenhouseSyncHandler: GreenhouseSyncHandler);
    process(job: Job<SyncJobData | EventJobData>): Promise<any>;
    private processEventJob;
    private syncCandidateEvent;
    private syncInterviewEvent;
    private processFullSyncJob;
}
export {};
