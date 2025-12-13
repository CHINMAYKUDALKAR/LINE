import { PrismaService } from '../../../common/prisma.service';
export declare class ZohoFieldMapService {
    private prisma;
    constructor(prisma: PrismaService);
    saveMapping(tenantId: string, module: string, mapping: any): Promise<void>;
    getMapping(tenantId: string, module: string): Promise<any>;
}
