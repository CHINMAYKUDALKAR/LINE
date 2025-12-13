import { WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
export declare class RetryProcessor extends WorkerHost {
    private syncQueue;
    private readonly logger;
    constructor(syncQueue: Queue);
    process(job: Job): Promise<any>;
    retryAll(): Promise<void>;
}
