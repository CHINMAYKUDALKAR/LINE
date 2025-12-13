import { IntegrationsQueue } from '../queues/integrations.queue';
export declare class WebhookRouter {
    private queue;
    constructor(queue: IntegrationsQueue);
    route(provider: string, tenantId: string, payload: any): Promise<void>;
}
