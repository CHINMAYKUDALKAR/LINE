import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { VariableResolverService } from '../services/variable-resolver.service';
import { AutomationJobData } from '../queues';
export declare class AutomationProcessor extends WorkerHost {
    private prisma;
    private variableResolver;
    private emailQueue;
    private whatsappQueue;
    private smsQueue;
    private readonly logger;
    constructor(prisma: PrismaService, variableResolver: VariableResolverService, emailQueue: Queue, whatsappQueue: Queue, smsQueue: Queue);
    process(job: Job<AutomationJobData>): Promise<void>;
    private calculateScheduledTime;
    private sendImmediate;
    private scheduleMessage;
    private resolveRecipient;
    private renderTemplate;
    private getQueueForChannel;
    onFailed(job: Job<AutomationJobData>, error: Error): void;
    onCompleted(job: Job<AutomationJobData>): void;
}
