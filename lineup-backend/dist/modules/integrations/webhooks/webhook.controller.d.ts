import { WebhookService } from './webhook.service';
export declare class WebhookController {
    private webhookService;
    private readonly logger;
    constructor(webhookService: WebhookService);
    receiveWebhook(provider: string, payload: any): Promise<any>;
}
