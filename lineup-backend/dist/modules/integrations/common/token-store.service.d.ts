import { PrismaService } from '../../../common/prisma.service';
export declare class TokenStoreService {
    private prisma;
    constructor(prisma: PrismaService);
    saveTokens(tenantId: string, provider: string, tokens: any): Promise<void>;
    getDecryptedToken(tenantId: string, provider: string): Promise<any>;
}
