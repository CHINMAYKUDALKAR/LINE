import { Module } from '@nestjs/common';
import { ZohoController } from './zoho.controller';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoSyncService } from './zoho.sync.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';
import { ZohoWebhookService } from './zoho.webhook.service';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  controllers: [ZohoController],
  providers: [
    PrismaService,
    ZohoOAuthService,
    ZohoSyncService,
    ZohoFieldMapService,
    ZohoWebhookService,
  ],
  exports: [ZohoSyncService]
})
export class ZohoModule { }