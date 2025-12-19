import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { ConnectDto } from './dto/connect.dto';
import { UpdateMappingDto } from './dto/mapping.dto';
import { TriggerSyncDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard, RbacGuard)
export class IntegrationsController {
    constructor(private integrationsService: IntegrationsService) { }

    /**
     * List all integrations for the tenant
     */
    @Get()
    @Roles(Role.ADMIN, Role.MANAGER)
    async listIntegrations(@Req() req: any) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.listIntegrations(tenantId);
    }

    /**
     * Get a specific integration
     */
    @Get(':provider')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getIntegration(@Req() req: any, @Query('provider') provider: string) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getIntegration(tenantId, provider);
    }

    /**
     * Initiate OAuth connection flow
     * Returns authorization URL for the provider
     */
    @Post('connect')
    @Roles(Role.ADMIN)
    async connect(@Req() req: any, @Body() connectDto: ConnectDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.connect(
            tenantId,
            connectDto.provider,
            userId,
        );
    }

    /**
     * Handle OAuth callback
     * This endpoint receives the authorization code from the provider
     */
    @Get('callback')
    async callback(
        @Query('provider') provider: string,
        @Query('code') code: string,
        @Query('state') state: string,
        @Req() req: any,
    ) {
        const userId = req.user?.id || 'system';
        return this.integrationsService.callback(provider, code, state, userId);
    }

    /**
     * Update field mapping configuration
     */
    @Post('mapping')
    @Roles(Role.ADMIN)
    async updateMapping(@Req() req: any, @Body() mappingDto: UpdateMappingDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.updateMapping(
            tenantId,
            mappingDto.provider,
            mappingDto,
            userId,
        );
    }

    /**
     * Trigger manual sync
     */
    @Post('sync')
    @Roles(Role.ADMIN, Role.MANAGER)
    async triggerSync(@Req() req: any, @Body() syncDto: TriggerSyncDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        const since = syncDto.since ? new Date(syncDto.since) : undefined;
        return this.integrationsService.syncNow(
            tenantId,
            syncDto.provider,
            userId,
            since,
        );
    }

    /**
     * Disconnect an integration
     */
    @Post('disconnect')
    @Roles(Role.ADMIN)
    async disconnect(@Req() req: any, @Body() body: { provider: string }) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.disconnect(tenantId, body.provider, userId);
    }

    /**
     * Get webhook events for an integration
     */
    @Get(':provider/webhooks')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getWebhooks(
        @Req() req: any,
        @Query('provider') provider: string,
        @Query('limit') limit?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getWebhookEvents(tenantId, provider, parseInt(limit || '50'));
    }

    /**
     * Get sync metrics for an integration
     */
    @Get(':provider/metrics')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getMetrics(
        @Req() req: any,
        @Query('provider') provider: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getMetrics(tenantId, provider);
    }

    /**
     * Get field schemas for mapping
     */
    @Get(':provider/fields')
    @Roles(Role.ADMIN, Role.MANAGER)
    async getFields(
        @Req() req: any,
        @Query('provider') provider: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getFieldSchemas(tenantId, provider);
    }
}
