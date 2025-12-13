import { Controller, Post, Body, Param, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('api/v1/integrations/webhooks')
export class WebhookController {
    constructor(private webhookService: WebhookService) { }

    /**
     * Receive webhook events from integration providers
     * No authentication required as providers send webhooks directly
     */
    @Post(':provider')
    @HttpCode(200)
    async receiveWebhook(
        @Param('provider') provider: string,
        @Body() payload: any,
    ) {
        return this.webhookService.handle(provider, payload);
    }
}
