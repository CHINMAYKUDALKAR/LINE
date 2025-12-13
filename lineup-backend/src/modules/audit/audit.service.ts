import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(data: any): Promise<void> {
        // Log to database
        await this.prisma.auditLog.create({ data });
    }

    async findAll(tenantId: string, filters?: {
        user?: string;
        action?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        perPage?: number;
    }) {
        const page = filters?.page || 1;
        const perPage = filters?.perPage || 50;
        const skip = (page - 1) * perPage;

        const where: any = { tenantId };

        if (filters?.user) {
            where.userId = filters.user;
        }

        if (filters?.action) {
            where.action = { contains: filters.action, mode: 'insensitive' };
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters?.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
            if (filters?.dateTo) where.createdAt.lte = new Date(filters.dateTo);
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: perPage,
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            this.prisma.auditLog.count({ where })
        ]);

        return {
            data: logs.map(log => ({
                id: log.id,
                timestamp: log.createdAt.toISOString(),
                user: log.user?.email || log.userId || 'System',
                action: log.action,
                metadata: log.metadata,
                ipAddress: (log.metadata as any)?.ip || '-',
                severity: this.getSeverity(log.action)
            })),
            total,
            page,
            perPage
        };
    }

    private getSeverity(action: string): 'info' | 'warning' | 'error' {
        if (action.includes('FAILED') || action.includes('ERROR')) return 'error';
        if (action.includes('LOGIN') || action.includes('SSO')) return 'warning';
        return 'info';
    }

    async exportCSV(tenantId: string) {
        const { data } = await this.findAll(tenantId, { perPage: 1000 });

        const header = ['Timestamp', 'User', 'Action', 'IP Address', 'Severity'];
        const rows = data.map(log => [
            log.timestamp,
            log.user,
            log.action,
            log.ipAddress,
            log.severity
        ]);

        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        return { csv, filename: `audit-logs-${Date.now()}.csv` };
    }
}