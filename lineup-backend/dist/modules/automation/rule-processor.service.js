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
var RuleProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleProcessor = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
const client_1 = require("@prisma/client");
const message_service_1 = require("../communication/services/message.service");
const candidates_service_1 = require("../candidates/candidates.service");
let RuleProcessor = RuleProcessor_1 = class RuleProcessor {
    prisma;
    messageService;
    candidatesService;
    logger = new common_1.Logger(RuleProcessor_1.name);
    constructor(prisma, messageService, candidatesService) {
        this.prisma = prisma;
        this.messageService = messageService;
        this.candidatesService = candidatesService;
    }
    async handleFeedbackSubmitted(payload) {
        await this.processRules(client_1.AutomationTrigger.FEEDBACK_SUBMITTED, payload.tenantId, payload);
    }
    async handleStageChanged(payload) {
        await this.processRules(client_1.AutomationTrigger.CANDIDATE_STAGE_CHANGED, payload.tenantId, payload);
    }
    async handleInterviewNoShow(payload) {
        await this.processRules(client_1.AutomationTrigger.INTERVIEW_NO_SHOW, payload.tenantId, payload);
    }
    async processRules(trigger, tenantId, context) {
        const rules = await this.prisma.automationRule.findMany({
            where: {
                tenantId,
                trigger,
                isActive: true,
            },
            include: { template: true },
        });
        this.logger.log(`Found ${rules.length} rules for trigger ${trigger} in tenant ${tenantId}`);
        for (const rule of rules) {
            try {
                if (this.evaluateConditions(rule.conditions, context)) {
                    await this.executeAction(rule, context);
                }
            }
            catch (error) {
                this.logger.error(`Error executing rule ${rule.id}: ${error.message}`, error.stack);
            }
        }
    }
    evaluateConditions(conditions, context) {
        if (!conditions)
            return true;
        for (const [key, value] of Object.entries(conditions)) {
            const contextValue = context[key];
            if (typeof value === 'object' && value !== null) {
                const op = Object.keys(value)[0];
                const variable = key;
                const contextVariableValue = context[variable];
                if (contextVariableValue === undefined)
                    return false;
                const target = value[op];
                if (target === undefined)
                    return false;
                if (op === 'lt' && !(contextVariableValue < target))
                    return false;
                if (op === 'gt' && !(contextVariableValue > target))
                    return false;
                if (op === 'eq' && !(contextVariableValue === target))
                    return false;
                if (op === 'neq' && !(contextVariableValue !== target))
                    return false;
            }
            else {
                if (contextValue !== value)
                    return false;
            }
        }
        return true;
    }
    async executeAction(rule, context) {
        this.logger.log(`Executing rule ${rule.name} (Action: ${rule.actionType})`);
        switch (rule.actionType) {
            case client_1.AutomationActionType.SEND_COMMUNICATION:
                if (rule.channel && rule.templateId) {
                    const candidateId = context.candidateId;
                    if (candidateId) {
                        const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
                        if (candidate?.email) {
                            await this.messageService.send(rule.tenantId, {
                                channel: rule.channel,
                                templateId: rule.templateId,
                                recipientType: 'CANDIDATE',
                                recipientId: candidateId,
                                context: context
                            });
                        }
                    }
                }
                break;
            case client_1.AutomationActionType.UPDATE_STAGE:
                const targetStage = rule.actionData?.stage;
                if (targetStage && context.candidateId) {
                    await this.candidatesService.update(rule.tenantId, undefined, context.candidateId, { stage: targetStage });
                }
                break;
        }
    }
};
exports.RuleProcessor = RuleProcessor;
__decorate([
    (0, event_emitter_1.OnEvent)('feedback.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RuleProcessor.prototype, "handleFeedbackSubmitted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('candidate.stage.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RuleProcessor.prototype, "handleStageChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)('interview.no_show'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RuleProcessor.prototype, "handleInterviewNoShow", null);
exports.RuleProcessor = RuleProcessor = RuleProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        message_service_1.MessageService,
        candidates_service_1.CandidatesService])
], RuleProcessor);
//# sourceMappingURL=rule-processor.service.js.map