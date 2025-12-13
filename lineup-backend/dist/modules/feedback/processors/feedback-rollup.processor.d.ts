import { Worker } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
export declare const startFeedbackRollupProcessor: (prisma: PrismaService) => Worker<any, any, string>;
