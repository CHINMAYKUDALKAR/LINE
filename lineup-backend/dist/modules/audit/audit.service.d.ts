import { PrismaService } from "../../common/prisma.service";
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: any): Promise<void>;
    findAll(tenantId: string, filters?: {
        user?: string;
        action?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        perPage?: number;
    }): Promise<{
        data: {
            id: string;
            timestamp: string;
            user: string;
            action: string;
            metadata: import(".prisma/client").Prisma.JsonValue;
            ipAddress: any;
            severity: "error" | "info" | "warning";
        }[];
        total: number;
        page: number;
        perPage: number;
    }>;
    private getSeverity;
    exportCSV(tenantId: string): Promise<{
        csv: string;
        filename: string;
    }>;
}
