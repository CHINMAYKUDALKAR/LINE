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
const prisma_service_1 = require("../../../common/prisma.service");
const client_1 = require("@prisma/client");
let AutomationService = class AutomationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.automationRule.findMany({
            where: { tenantId },
            include: { template: true },
            orderBy: { trigger: 'asc' },
        });
    }
    async findOne(tenantId, id) {
        const rule = await this.prisma.automationRule.findFirst({
            where: { id, tenantId },
            include: { template: true },
        });
        if (!rule) {
            throw new common_1.NotFoundException('Automation rule not found');
        }
        return rule;
    }
    async create(tenantId, dto, userId) {
        const existing = await this.prisma.automationRule.findFirst({
            where: { tenantId, trigger: dto.trigger, channel: dto.channel },
        });
        if (existing) {
            throw new common_1.ConflictException('An automation rule already exists for this trigger and channel combination');
        }
        const template = await this.prisma.messageTemplate.findFirst({
            where: { id: dto.templateId, tenantId },
        });
        if (!template) {
            throw new common_1.BadRequestException('Template not found');
        }
        if (template.channel !== dto.channel) {
            throw new common_1.BadRequestException('Template channel does not match rule channel');
        }
        return this.prisma.automationRule.create({
            data: {
                tenantId,
                name: dto.name,
                trigger: dto.trigger,
                channel: dto.channel,
                templateId: dto.templateId,
                delay: dto.delay || 0,
                conditions: dto.conditions,
                createdById: userId,
            },
            include: { template: true },
        });
    }
    async update(tenantId, id, dto) {
        const rule = await this.findOne(tenantId, id);
        if (dto.templateId && dto.templateId !== rule.templateId) {
            const template = await this.prisma.messageTemplate.findFirst({
                where: { id: dto.templateId, tenantId },
            });
            if (!template) {
                throw new common_1.BadRequestException('Template not found');
            }
            if (template.channel !== rule.channel) {
                throw new common_1.BadRequestException('Template channel does not match rule channel');
            }
        }
        return this.prisma.automationRule.update({
            where: { id },
            data: dto,
            include: { template: true },
        });
    }
    async delete(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.automationRule.delete({ where: { id } });
    }
    async toggle(tenantId, id) {
        const rule = await this.findOne(tenantId, id);
        return this.prisma.automationRule.update({
            where: { id },
            data: { isActive: !rule.isActive },
            include: { template: true },
        });
    }
    async getActiveRulesForTrigger(tenantId, trigger) {
        return this.prisma.automationRule.findMany({
            where: {
                tenantId,
                trigger,
                isActive: true,
            },
            include: { template: true },
        });
    }
    async processTrigger(tenantId, trigger, context) {
        const rules = await this.getActiveRulesForTrigger(tenantId, trigger);
        if (rules.length === 0) {
            return { processed: 0 };
        }
        console.log(`Processing trigger ${trigger} for tenant ${tenantId}:`, {
            rulesCount: rules.length,
            context,
        });
        return { processed: rules.length };
    }
    getAvailableTriggers() {
        return [
            { trigger: client_1.AutomationTrigger.INTERVIEW_SCHEDULED, description: 'When an interview is scheduled' },
            { trigger: client_1.AutomationTrigger.INTERVIEW_REMINDER_24H, description: '24 hours before interview' },
            { trigger: client_1.AutomationTrigger.INTERVIEW_REMINDER_1H, description: '1 hour before interview' },
            { trigger: client_1.AutomationTrigger.INTERVIEW_RESCHEDULED, description: 'When an interview is rescheduled' },
            { trigger: client_1.AutomationTrigger.INTERVIEW_CANCELLED, description: 'When an interview is cancelled' },
            { trigger: client_1.AutomationTrigger.INTERVIEW_COMPLETED, description: 'When an interview is completed' },
            { trigger: client_1.AutomationTrigger.FEEDBACK_SUBMITTED, description: 'When feedback is submitted' },
            { trigger: client_1.AutomationTrigger.CANDIDATE_STAGE_CHANGED, description: 'When candidate stage changes' },
            { trigger: client_1.AutomationTrigger.OFFER_EXTENDED, description: 'When an offer is extended' },
        ];
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map