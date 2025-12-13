import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../email/email.service';
import { Role, Prisma } from '@prisma/client';
export declare class InvitationService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    private generateToken;
    private hashToken;
    createInvite(tenantId: string, email: string, role?: Role, createdBy?: string, expiresInDays?: number): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        expiresAt: Date;
        inviteUrl: string;
    }>;
    getInviteByToken(token: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        expiresAt: Date;
        tenant: {
            name: string;
            id: string;
            brandingLogoUrl: string | null;
            brandingColors: Prisma.JsonValue;
        };
    }>;
    verifyToken(token: string): Promise<string>;
    markInviteUsed(inviteId: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        tokenHash: string;
        expiresAt: Date;
        createdBy: string | null;
        usedAt: Date | null;
        createdAt: Date;
    }>;
    listPendingInvites(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        tokenHash: string;
        expiresAt: Date;
        createdBy: string | null;
        usedAt: Date | null;
        createdAt: Date;
    }[]>;
    cancelInvite(tenantId: string, inviteId: string): Promise<{
        id: string;
        tenantId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        tokenHash: string;
        expiresAt: Date;
        createdBy: string | null;
        usedAt: Date | null;
        createdAt: Date;
    }>;
    private getInviteEmailTemplate;
}
