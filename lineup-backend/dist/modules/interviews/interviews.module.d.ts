import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
export declare class InterviewsModule implements OnModuleInit {
    private interviewsQueue;
    constructor(interviewsQueue: Queue);
    onModuleInit(): Promise<void>;
}
