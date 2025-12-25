import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';

/**
 * Scheduled Zoho Sync Service
 * 
 * Runs hourly sync jobs for all connected Zoho integrations.
 */
@Injectable()
export class ZohoSchedulerService {
    private readonly logger = new Logger(ZohoSchedulerService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('zoho-sync') private syncQueue: Queue,
    ) { }

    /**
     * Hourly sync trigger for all connected Zoho integrations
     */
    @Cron(CronExpression.EVERY_HOUR)
    async triggerHourlySync() {
        this.logger.log('Starting hourly Zoho sync...');

        try {
            // Find all active Zoho integrations
            const integrations = await this.prisma.integration.findMany({
                where: {
                    provider: 'zoho',
                    status: 'connected',
                },
                select: {
                    tenantId: true,
                },
            });

            this.logger.log(`Found ${integrations.length} connected Zoho integrations`);

            // Queue sync jobs for each tenant
            for (const integration of integrations) {
                await this.syncQueue.add('scheduled-sync', {
                    tenantId: integration.tenantId,
                    module: 'contacts', // Default to contacts; can be made configurable
                    triggeredBy: 'scheduler',
                });
                this.logger.log(`Queued sync for tenant: ${integration.tenantId}`);
            }

            this.logger.log('Hourly Zoho sync jobs queued successfully');
        } catch (error: any) {
            this.logger.error(`Failed to trigger hourly sync: ${error.message}`);
        }
    }

    /**
     * Manual trigger for testing (can be called via controller)
     */
    async triggerManualSync(tenantId: string, module: string = 'contacts') {
        await this.syncQueue.add('manual-sync', {
            tenantId,
            module,
            triggeredBy: 'manual',
        });
        return { success: true, message: 'Sync job queued' };
    }
}
