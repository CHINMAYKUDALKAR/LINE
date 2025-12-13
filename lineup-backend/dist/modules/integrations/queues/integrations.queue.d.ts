import { Queue } from 'bullmq';
export declare class IntegrationsQueue {
    private queue;
    constructor();
    getQueue(): Queue<any, any, string, any, any, string>;
}
