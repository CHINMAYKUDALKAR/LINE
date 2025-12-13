import { Queue } from 'bullmq';
export interface QueueMetrics {
    queue: string;
    waiting: number;
    active: number;
    completed24h: number;
    failed24h: number;
    avgJobDurationMs: number;
}
export declare class QueueMetricsService {
    private emailQueue;
    private whatsappQueue;
    private smsQueue;
    private automationQueue;
    private schedulerQueue;
    private dlqQueue;
    constructor(emailQueue: Queue, whatsappQueue: Queue, smsQueue: Queue, automationQueue: Queue, schedulerQueue: Queue, dlqQueue: Queue);
    getMetrics(): Promise<QueueMetrics[]>;
    getQueueMetrics(queueName: string): Promise<QueueMetrics | null>;
}
