import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../email/email.service';
export declare class PasswordResetService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    private generateToken;
    private hashToken;
    initiateReset(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateToken(token: string): Promise<{
        valid: boolean;
        email?: string;
    }>;
    executeReset(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private getResetEmailTemplate;
}
