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
exports.SchedulingRulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let SchedulingRulesService = class SchedulingRulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRules(tenantId) {
        return this.prisma.schedulingRule.findMany({
            where: { tenantId },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
    }
    async getRule(tenantId, ruleId) {
        const rule = await this.prisma.schedulingRule.findFirst({
            where: { id: ruleId, tenantId },
        });
        if (!rule) {
            throw new common_1.NotFoundException('Scheduling rule not found');
        }
        return rule;
    }
    async getDefaultRule(tenantId) {
        let rule = await this.prisma.schedulingRule.findFirst({
            where: { tenantId, isDefault: true },
        });
        if (!rule) {
            rule = await this.createDefaultRule(tenantId);
        }
        return rule;
    }
    async createRule(tenantId, userId, dto) {
        if (dto.isDefault) {
            await this.prisma.schedulingRule.updateMany({
                where: { tenantId, isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.schedulingRule.create({
            data: {
                tenantId,
                name: dto.name,
                minNoticeMins: dto.minNoticeMins ?? 60,
                bufferBeforeMins: dto.bufferBeforeMins ?? 10,
                bufferAfterMins: dto.bufferAfterMins ?? 10,
                defaultSlotMins: dto.defaultSlotMins ?? 60,
                allowOverlapping: dto.allowOverlapping ?? false,
                isDefault: dto.isDefault ?? false,
                createdBy: userId,
            },
        });
    }
    async updateRule(tenantId, ruleId, dto) {
        const rule = await this.getRule(tenantId, ruleId);
        if (dto.isDefault) {
            await this.prisma.schedulingRule.updateMany({
                where: { tenantId, isDefault: true, id: { not: ruleId } },
                data: { isDefault: false },
            });
        }
        return this.prisma.schedulingRule.update({
            where: { id: ruleId },
            data: {
                name: dto.name ?? rule.name,
                minNoticeMins: dto.minNoticeMins ?? rule.minNoticeMins,
                bufferBeforeMins: dto.bufferBeforeMins ?? rule.bufferBeforeMins,
                bufferAfterMins: dto.bufferAfterMins ?? rule.bufferAfterMins,
                defaultSlotMins: dto.defaultSlotMins ?? rule.defaultSlotMins,
                allowOverlapping: dto.allowOverlapping ?? rule.allowOverlapping,
                isDefault: dto.isDefault ?? rule.isDefault,
            },
        });
    }
    async deleteRule(tenantId, ruleId) {
        const rule = await this.getRule(tenantId, ruleId);
        if (rule.isDefault) {
            throw new Error('Cannot delete the default scheduling rule');
        }
        return this.prisma.schedulingRule.delete({
            where: { id: ruleId },
        });
    }
    async createDefaultRule(tenantId) {
        return this.prisma.schedulingRule.create({
            data: {
                tenantId,
                name: 'Default',
                minNoticeMins: 60,
                bufferBeforeMins: 10,
                bufferAfterMins: 10,
                defaultSlotMins: 60,
                allowOverlapping: false,
                isDefault: true,
            },
        });
    }
};
exports.SchedulingRulesService = SchedulingRulesService;
exports.SchedulingRulesService = SchedulingRulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulingRulesService);
//# sourceMappingURL=scheduling-rules.service.js.map