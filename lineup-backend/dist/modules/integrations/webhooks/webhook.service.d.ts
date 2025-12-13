import { IntegrationsService } from '../integrations.service';
export declare class WebhookService {
    private integrationsService;
    constructor(integrationsService: IntegrationsService);
    handle(provider: string, payload: any): Promise<any>;
}
