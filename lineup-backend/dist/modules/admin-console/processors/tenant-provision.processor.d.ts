import { Worker } from 'bullmq';
import { PrismaService } from '../../../common/prisma.service';
import { EmailService } from '../../email/email.service';
export declare const startTenantProvisionProcessor: (prisma: PrismaService, emailService: EmailService) => Worker<any, any, string>;
