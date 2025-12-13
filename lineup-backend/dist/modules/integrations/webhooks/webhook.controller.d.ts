import { WebhookService } from './webhook.service';
export declare class WebhookController {
    private webhookService;
    constructor(webhookService: WebhookService);
    receiveWebhook(provider: string, payload: any): Promise<any>;
}
