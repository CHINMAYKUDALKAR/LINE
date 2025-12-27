import { PrismaService } from '../../../common/prisma.service';
import { ChannelConfigDto } from '../dto';
import { Channel } from '@prisma/client';
export declare class ChannelService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        credentials: Record<string, any>;
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }[]>;
    findOne(tenantId: string, channel: Channel): Promise<{
        credentials: Record<string, any>;
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }>;
    getConfigForSending(tenantId: string, channel: Channel): Promise<{
        credentials: any;
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    } | null>;
    upsert(tenantId: string, dto: ChannelConfigDto): Promise<{
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        credentials: import("@prisma/client/runtime/library").JsonValue;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }>;
    test(tenantId: string, channel: Channel): Promise<{
        success: boolean;
        message: string;
    }>;
    delete(tenantId: string, channel: Channel): Promise<{
        id: string;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        credentials: import("@prisma/client/runtime/library").JsonValue;
        tenantId: string;
        provider: string;
        isActive: boolean;
        channel: import("@prisma/client").$Enums.Channel;
        isVerified: boolean;
        lastTestedAt: Date | null;
    }>;
    private getProvider;
    private maskCredentials;
    private testEmail;
    private testWhatsApp;
    private testSms;
}
