import { Worker } from 'bullmq';
import { IntegrationFactory } from '../common/integration-factory.service';
import { PrismaService } from '../../../common/prisma.service';
export declare const startIntegrationsProcessor: (prisma: PrismaService, factory: IntegrationFactory) => Worker<any, any, string>;
