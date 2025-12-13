import { Worker } from 'bullmq';
import { PrismaService } from '../../../../common/prisma.service';
import { ZohoSyncService } from '../zoho.sync.service';
export declare const startZohoSyncProcessor: (prisma: PrismaService, sync: ZohoSyncService) => Worker<any, any, string>;
