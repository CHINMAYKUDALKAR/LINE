import { PrismaService } from '../../../common/prisma.service';
export interface TenantUsageMetrics {
    tenantId: string;
    tenantName: string;
    candidates: number;
    interviews: number;
    messageVolume30d: number;
    storageUsedMb: number;
}
export declare class TenantUsageService {
    private prisma;
    constructor(prisma: PrismaService);
    getMetrics(): Promise<TenantUsageMetrics[]>;
    getTenantMetrics(tenantId: string): Promise<TenantUsageMetrics | null>;
}
