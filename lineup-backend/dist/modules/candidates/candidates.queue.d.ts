import { Queue } from 'bullmq';
export declare class CandidatesQueue {
    private queue;
    constructor();
    getQueue(): Queue<any, any, string, any, any, string>;
}
