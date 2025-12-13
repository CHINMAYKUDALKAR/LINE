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
exports.TenantUsageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let TenantUsageService = class TenantUsageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const tenants = await this.prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        const results = await Promise.all(tenants.map(async (tenant) => {
            const [candidateCount, interviewCount, messageCount, storageSum,] = await Promise.all([
                this.prisma.candidate.count({
                    where: { tenantId: tenant.id },
                }),
                this.prisma.interview.count({
                    where: { tenantId: tenant.id },
                }),
                this.prisma.messageLog.count({
                    where: {
                        tenantId: tenant.id,
                        createdAt: { gte: thirtyDaysAgo },
                    },
                }),
                this.prisma.fileObject.aggregate({
                    where: {
                        tenantId: tenant.id,
                        status: 'active',
                    },
                    _sum: { size: true },
                }),
            ]);
            const storageMb = ((storageSum._sum.size || 0) / (1024 * 1024));
            return {
                tenantId: tenant.id,
                tenantName: tenant.name,
                candidates: candidateCount,
                interviews: interviewCount,
                messageVolume30d: messageCount,
                storageUsedMb: Math.round(storageMb * 100) / 100,
            };
        }));
        return results.sort((a, b) => (b.candidates + b.interviews) - (a.candidates + a.interviews));
    }
    async getTenantMetrics(tenantId) {
        const metrics = await this.getMetrics();
        return metrics.find(m => m.tenantId === tenantId) || null;
    }
};
exports.TenantUsageService = TenantUsageService;
exports.TenantUsageService = TenantUsageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantUsageService);
//# sourceMappingURL=tenant-usage.service.js.map