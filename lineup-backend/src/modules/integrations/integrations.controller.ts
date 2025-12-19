import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { ConnectDto } from './dto/connect.dto';
import { UpdateMappingDto } from './dto/mapping.dto';
import { TriggerSyncDto } from './dto/sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('integrations')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard, RbacGuard)
export class IntegrationsController {
    constructor(private integrationsService: IntegrationsService) { }

    @Get()
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'List all integrations for the tenant' })
    @ApiResponse({ status: 200, description: 'List of configured integrations with their status' })
    async listIntegrations(@Req() req: any) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.listIntegrations(tenantId);
    }

    @Get(':provider')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get a specific integration details' })
    @ApiParam({ name: 'provider', description: 'Integration provider (e.g., zoho, google, outlook)' })
    @ApiResponse({ status: 200, description: 'Integration details and configuration' })
    @ApiResponse({ status: 404, description: 'Integration not found' })
    async getIntegration(@Req() req: any, @Param('provider') provider: string) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getIntegration(tenantId, provider);
    }

    @Post('connect')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Initiate OAuth connection flow for a provider' })
    @ApiBody({ type: ConnectDto })
    @ApiResponse({ status: 200, description: 'Authorization URL for OAuth flow', schema: { example: { authUrl: 'https://...' } } })
    @ApiResponse({ status: 400, description: 'Invalid provider' })
    async connect(@Req() req: any, @Body() connectDto: ConnectDto) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.connect(
            tenantId,
            connectDto.provider,
            userId,
        );
    }

    @Get('callback')
    @ApiOperation({ summary: 'Handle OAuth callback from provider' })
    @ApiQuery({ name: 'provider', description: 'Integration provider' })
    @ApiQuery({ name: 'code', description: 'Authorization code from provider' })
    @ApiQuery({ name: 'state', description: 'State parameter for CSRF protection' })
    @ApiResponse({ status: 200, description: 'Integration connected successfully' })
    @ApiResponse({ status: 400, description: 'Invalid code or state' })
    async callback(
        @Query('provider') provider: string,
        @Query('code') code: string,
        @Query('state') state: string,
        @Req() req: any,
    ) {
        const userId = req.user?.id || 'system';
        return this.integrationsService.callback(provider, code, state, userId);
    }

    @Post('mapping')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update field mapping configuration for an integration' })
    @ApiBody({ type: UpdateMappingDto })
    @ApiResponse({ status: 200, description: 'Mapping updated successfully' })
    @ApiResponse({ status: 404, description: 'Integration not found' })
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

    @Post('sync')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Trigger manual sync with external system' })
    @ApiBody({ type: TriggerSyncDto })
    @ApiResponse({ status: 200, description: 'Sync triggered successfully', schema: { example: { synced: 25, errors: 0 } } })
    @ApiResponse({ status: 404, description: 'Integration not connected' })
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

    @Post('disconnect')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Disconnect an integration' })
    @ApiBody({ schema: { example: { provider: 'zoho' } } })
    @ApiResponse({ status: 200, description: 'Integration disconnected' })
    @ApiResponse({ status: 404, description: 'Integration not found' })
    async disconnect(@Req() req: any, @Body() body: { provider: string }) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.integrationsService.disconnect(tenantId, body.provider, userId);
    }

    @Get(':provider/webhooks')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get webhook events for an integration' })
    @ApiParam({ name: 'provider', description: 'Integration provider' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of events to return (default: 50)' })
    @ApiResponse({ status: 200, description: 'List of recent webhook events' })
    async getWebhooks(
        @Req() req: any,
        @Param('provider') provider: string,
        @Query('limit') limit?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getWebhookEvents(tenantId, provider, parseInt(limit || '50'));
    }

    @Get(':provider/metrics')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get sync metrics and statistics for an integration' })
    @ApiParam({ name: 'provider', description: 'Integration provider' })
    @ApiResponse({ status: 200, description: 'Sync metrics including success rate, last sync time, etc.' })
    async getMetrics(
        @Req() req: any,
        @Param('provider') provider: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getMetrics(tenantId, provider);
    }

    @Get(':provider/fields')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get field schemas for mapping configuration' })
    @ApiParam({ name: 'provider', description: 'Integration provider' })
    @ApiResponse({ status: 200, description: 'Available fields from both Lineup and external system for mapping' })
    async getFields(
        @Req() req: any,
        @Param('provider') provider: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getFieldSchemas(tenantId, provider);
    }

    @Get(':provider/status')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get integration status and sync statistics' })
    @ApiParam({ name: 'provider', description: 'Integration provider' })
    @ApiResponse({ status: 200, description: 'Integration status with capabilities and 24h stats' })
    async getStatus(
        @Req() req: any,
        @Param('provider') provider: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getIntegrationStatus(tenantId, provider);
    }

    @Get(':provider/sync-logs')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get sync logs for an integration' })
    @ApiParam({ name: 'provider', description: 'Integration provider' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of logs to return (default: 50)' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status (SUCCESS, FAILED, PENDING)' })
    @ApiResponse({ status: 200, description: 'List of sync log entries' })
    async getSyncLogs(
        @Req() req: any,
        @Param('provider') provider: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getSyncLogs(tenantId, provider, parseInt(limit || '50'), status);
    }

    @Get(':provider/failure-summary')
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get failure summary for an integration' })
    @ApiParam({ name: 'provider', description: 'Integration provider' })
    @ApiResponse({ status: 200, description: 'Error summary grouped by message with counts' })
    async getFailureSummary(
        @Req() req: any,
        @Param('provider') provider: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.integrationsService.getFailureSummary(tenantId, provider);
    }
}

