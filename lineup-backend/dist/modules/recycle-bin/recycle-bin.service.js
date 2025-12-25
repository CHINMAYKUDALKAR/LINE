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
exports.RecycleBinService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'SUPPORT'];
const DEFAULT_RETENTION_DAYS = Number(process.env.RECYCLE_BIN_RETENTION_DAYS) || 30;
let RecycleBinService = class RecycleBinService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRetentionDays(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });
        const tenantRetention = tenant?.settings?.recycleBinRetentionDays;
        if (typeof tenantRetention === 'number' && tenantRetention > 0) {
            return tenantRetention;
        }
        return DEFAULT_RETENTION_DAYS;
    }
    async softDelete(tenantId, userId, module, itemId, itemSnapshot) {
        const retentionDays = await this.getRetentionDays(tenantId);
        return this.prisma.$transaction(async (tx) => {
            if (module === 'candidate') {
                await tx.candidate.update({
                    where: { id: itemId },
                    data: { deletedAt: new Date() }
                });
            }
            else if (module === 'interview') {
                await tx.interview.update({
                    where: { id: itemId },
                    data: { deletedAt: new Date(), status: 'CANCELLED' }
                });
            }
            return tx.recycleBinItem.create({
                data: {
                    tenantId,
                    module,
                    itemId,
                    itemSnapshot,
                    deletedBy: userId,
                    expiresAt: new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000)
                }
            });
        });
    }
    async findAll(tenantId, userId, userRole, filters) {
        const page = filters?.page || 1;
        const perPage = Math.min(filters?.perPage || 20, 100);
        const where = {
            tenantId,
            restoredAt: null,
            purgedAt: null
        };
        if (!ADMIN_ROLES.includes(userRole)) {
            where.deletedBy = userId;
        }
        else if (filters?.deletedBy) {
            where.deletedBy = filters.deletedBy;
        }
        if (filters?.module) {
            where.module = filters.module;
        }
        if (filters?.from || filters?.to) {
            where.deletedAt = {};
            if (filters?.from)
                where.deletedAt.gte = new Date(filters.from);
            if (filters?.to)
                where.deletedAt.lte = new Date(filters.to);
        }
        const [total, data] = await Promise.all([
            this.prisma.recycleBinItem.count({ where }),
            this.prisma.recycleBinItem.findMany({
                where,
                skip: (page - 1) * perPage,
                take: perPage,
                orderBy: { deletedAt: 'desc' }
            })
        ]);
        return {
            data,
            meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) }
        };
    }
    async getStats(tenantId, userId, userRole) {
        const where = {
            tenantId,
            restoredAt: null,
            purgedAt: null
        };
        if (!ADMIN_ROLES.includes(userRole)) {
            where.deletedBy = userId;
        }
        const items = await this.prisma.recycleBinItem.groupBy({
            by: ['module'],
            where,
            _count: { id: true }
        });
        const byModule = items.map(item => ({
            module: item.module,
            count: item._count.id
        }));
        const total = byModule.reduce((sum, item) => sum + item.count, 0);
        return { total, byModule };
    }
    async findOne(tenantId, userId, userRole, id) {
        const item = await this.prisma.recycleBinItem.findUnique({ where: { id } });
        if (!item || item.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Item not found in recycle bin');
        }
        if (!ADMIN_ROLES.includes(userRole) && item.deletedBy !== userId) {
            throw new common_1.ForbiddenException('You can only view items you deleted');
        }
        return item;
    }
    async restore(tenantId, userId, userRole, id) {
        const item = await this.prisma.recycleBinItem.findUnique({ where: { id } });
        if (!item || item.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Item not found in recycle bin');
        }
        if (!ADMIN_ROLES.includes(userRole) && item.deletedBy !== userId) {
            throw new common_1.ForbiddenException('You can only restore items you deleted');
        }
        await this.prisma.$transaction(async (tx) => {
            if (item.module === 'candidate') {
                await tx.candidate.update({
                    where: { id: item.itemId },
                    data: { deletedAt: null }
                });
            }
            else if (item.module === 'interview') {
                await tx.interview.update({
                    where: { id: item.itemId },
                    data: { deletedAt: null }
                });
            }
            await tx.recycleBinItem.update({
                where: { id },
                data: { restoredAt: new Date() }
            });
            await tx.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'RECYCLE_BIN_RESTORE',
                    metadata: { recycleBinItemId: id, module: item.module, itemId: item.itemId }
                }
            });
        });
        return { success: true, message: 'Item restored successfully' };
    }
    async purge(tenantId, userId, userRole, id) {
        if (!ADMIN_ROLES.includes(userRole)) {
            throw new common_1.ForbiddenException('Only administrators can permanently delete items');
        }
        const item = await this.prisma.recycleBinItem.findUnique({ where: { id } });
        if (!item || item.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Item not found in recycle bin');
        }
        await this.prisma.$transaction(async (tx) => {
            if (item.module === 'candidate') {
                await tx.candidate.delete({ where: { id: item.itemId } });
            }
            else if (item.module === 'interview') {
                await tx.interview.delete({ where: { id: item.itemId } });
            }
            await tx.recycleBinItem.update({
                where: { id },
                data: { purgedAt: new Date() }
            });
            await tx.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'RECYCLE_BIN_PURGE',
                    metadata: { recycleBinItemId: id, module: item.module, itemId: item.itemId }
                }
            });
        });
        return { success: true, message: 'Item permanently deleted' };
    }
};
exports.RecycleBinService = RecycleBinService;
exports.RecycleBinService = RecycleBinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecycleBinService);
//# sourceMappingURL=recycle-bin.service.js.map