import { Queue } from 'bullmq';
export declare class InterviewsQueue {
    private queue;
    constructor();
    getQueue(): Queue<any, any, string, any, any, string>;
}
