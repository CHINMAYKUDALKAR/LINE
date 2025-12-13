import { Queue } from 'bullmq';
export declare class EmailQueue {
    private queue;
    constructor();
    getQueue(): Queue<any, any, string, any, any, string>;
}
