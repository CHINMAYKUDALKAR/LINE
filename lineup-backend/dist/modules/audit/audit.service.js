"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        await this.prisma.auditLog.create({ data });
    }
    async findAll(tenantId, filters) {
        const page = filters?.page || 1;
        const perPage = filters?.perPage || 50;
        const skip = (page - 1) * perPage;
        const where = { tenantId };
        if (filters?.user) {
            where.userId = filters.user;
        }
        if (filters?.action) {
            where.action = { contains: filters.action, mode: 'insensitive' };
        }
        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {};
            if (filters?.dateFrom)
                where.createdAt.gte = new Date(filters.dateFrom);
            if (filters?.dateTo)
                where.createdAt.lte = new Date(filters.dateTo);
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
                ipAddress: log.metadata?.ip || '-',
                severity: this.getSeverity(log.action)
            })),
            total,
            page,
            perPage
        };
    }
    getSeverity(action) {
        if (action.includes('FAILED') || action.includes('ERROR'))
            return 'error';
        if (action.includes('LOGIN') || action.includes('SSO'))
            return 'warning';
        return 'info';
    }
    async exportCSV(tenantId) {
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
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map