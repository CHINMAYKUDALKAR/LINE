import { Controller, Get, Query, Req, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '../../../common/auth.guard';
import { RbacGuard } from '../../../common/rbac.guard';
import { Roles } from '../../../common/roles.decorator';
import { ZohoOAuthService } from './zoho.oauth.service';
import { ZohoSyncService } from './zoho.sync.service';
import { ZohoFieldMapService } from './zoho.fieldmap.service';
import { ZohoWebhookService } from './zoho.webhook.service';
import { ZohoAuthDto } from './dto/zoho-auth.dto';
import { ZohoFieldMapDto } from './dto/zoho-fieldmap.dto';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Controller('api/v1/integrations/zoho')
export class ZohoController {
    private syncQueue = new Queue('zoho-sync', { connection: new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379') });

    constructor(
        private oauth: ZohoOAuthService,
        private sync: ZohoSyncService,
        private fieldmap: ZohoFieldMapService,
        private webhook: ZohoWebhookService
    ) { }

    @Get('auth-url')
    @UseGuards(AuthGuard, RbacGuard)
    @Roles('ADMIN', 'MANAGER')
    getAuthUrl(@Req() req: any, @Query('redirectUri') redirectUri: string) {
        return this.oauth.getAuthUrl(req.tenantId, redirectUri);
    }

    @Post('exchange')
    @UseGuards(AuthGuard, RbacGuard)
    @Roles('ADMIN', 'MANAGER')
    exchangeCode(@Req() req: any, @Body() dto: ZohoAuthDto) {
        return this.oauth.exchangeCode(req.tenantId, dto.code, dto.redirectUri);
    }

    @Post('sync')
    @UseGuards(AuthGuard, RbacGuard)
    @Roles('ADMIN', 'MANAGER')
    requestSync(@Req() req: any, @Body('module') module: string) {
        return this.syncQueue.add('sync-now', { tenantId: req.tenantId, module });
    }

    @Post('fieldmap')
    @UseGuards(AuthGuard, RbacGuard)
    @Roles('ADMIN', 'MANAGER')
    saveFieldMap(@Req() req: any, @Body() dto: ZohoFieldMapDto) {
        return this.fieldmap.saveMapping(req.tenantId, dto.module, dto.mapping);
    }

    // Webhook URL (public)
    @Post('webhook')
    zohoWebhook(@Query('tenantId') tenantId: string, @Body() body: any) {
        return this.webhook.handleWebhook(tenantId, body);
    }
}