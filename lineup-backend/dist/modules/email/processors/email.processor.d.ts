import { Worker } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { EmailService } from '../email.service';
export declare const startEmailProcessor: (prisma: PrismaService, emailService: EmailService) => Worker<any, any, string>;
