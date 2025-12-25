import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';

/**
 * Public controller for OAuth callbacks - no authentication required
 * OAuth providers redirect here after user authentication
 */
@ApiTags('integrations-oauth')
@Controller('api/v1/oauth')
export class OAuthCallbackController {
    constructor(private integrationsService: IntegrationsService) { }

    @Get('callback')
    @ApiOperation({ summary: 'Handle OAuth callback from provider (public endpoint)' })
    @ApiQuery({ name: 'code', description: 'Authorization code from provider' })
    @ApiQuery({ name: 'state', description: 'State parameter for CSRF protection' })
    @ApiResponse({ status: 302, description: 'Redirects to frontend after success' })
    @ApiResponse({ status: 400, description: 'Invalid code or state' })
    async callback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: any,
    ) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        try {
            // The provider is determined from the state
            // For now, assume 'zoho' as the provider since it's the only one we're implementing
            const result = await this.integrationsService.callback('zoho', code, state, 'system');
            // Redirect to frontend integrations page with success
            return res.redirect(`${frontendUrl}/integrations?status=success&provider=${result.provider}`);
        } catch (error) {
            // Redirect to frontend integrations page with error
            return res.redirect(`${frontendUrl}/integrations?status=error&message=${encodeURIComponent(error.message)}`);
        }
    }
}
