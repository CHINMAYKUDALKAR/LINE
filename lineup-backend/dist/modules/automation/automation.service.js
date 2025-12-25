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
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AutomationService = class AutomationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRule(tenantId, userId, data) {
        const rule = await this.prisma.automationRule.create({
            data: {
                ...data,
                tenant: { connect: { id: tenantId } },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'automation.rule.created',
                metadata: { ruleId: rule.id, name: rule.name },
            },
        });
        return rule;
    }
    async getRules(tenantId, limit = 100) {
        return this.prisma.automationRule.findMany({
            where: { tenantId },
            include: { template: true },
            take: Math.min(limit, 100),
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateRule(tenantId, userId, id, data) {
        const rule = await this.prisma.automationRule.update({
            where: { id, tenantId },
            data,
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'automation.rule.updated',
                metadata: { ruleId: id, changes: JSON.parse(JSON.stringify(data)) },
            },
        });
        return rule;
    }
    async deleteRule(tenantId, userId, id) {
        const rule = await this.prisma.automationRule.delete({
            where: { id, tenantId },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'automation.rule.deleted',
                metadata: { ruleId: id, name: rule.name },
            },
        });
        return rule;
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map