import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ZohoController } from './zoho.controller';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoSyncService } from './zoho.sync.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';
import { ZohoWebhookService } from './zoho.webhook.service';
import { ZohoSchedulerService } from './zoho.scheduler.service';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'zoho-sync' }),
  ],
  controllers: [ZohoController],
  providers: [
    PrismaService,
    ZohoOAuthService,
    ZohoSyncService,
    ZohoFieldMapService,
    ZohoWebhookService,
    ZohoSchedulerService,
  ],
  exports: [ZohoSyncService, ZohoSchedulerService]
})
export class ZohoModule { }