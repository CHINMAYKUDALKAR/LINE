import { PrismaService } from '../../../common/prisma.service';
import { ChannelConfigDto } from '../dto';
import { Channel } from '@prisma/client';
export declare class ChannelService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        credentials: Record<string, any>;
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(tenantId: string, channel: Channel): Promise<{
        credentials: Record<string, any>;
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getConfigForSending(tenantId: string, channel: Channel): Promise<{
        credentials: any;
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    upsert(tenantId: string, dto: ChannelConfigDto): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        credentials: import(".prisma/client").Prisma.JsonValue;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    test(tenantId: string, channel: Channel): Promise<{
        success: boolean;
        message: string;
    }>;
    delete(tenantId: string, channel: Channel): Promise<{
        id: string;
        tenantId: string;
        channel: import(".prisma/client").$Enums.Channel;
        provider: string;
        credentials: import(".prisma/client").Prisma.JsonValue;
        settings: import(".prisma/client").Prisma.JsonValue | null;
        isActive: boolean;
        isVerified: boolean;
        lastTestedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private getProvider;
    private maskCredentials;
    private testEmail;
    private testWhatsApp;
    private testSms;
}
