import type { Response } from 'express';
import { AuditService } from './audit.service';
export declare class AuditController {
    private svc;
    constructor(svc: AuditService);
    findAll(req: any, user?: string, action?: string, dateFrom?: string, dateTo?: string, page?: string, perPage?: string): Promise<{
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
    exportCSV(req: any, res: Response): Promise<void>;
}
