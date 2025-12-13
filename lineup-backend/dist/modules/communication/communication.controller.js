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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/auth.guard");
const message_service_1 = require("./services/message.service");
const template_service_1 = require("./services/template.service");
const automation_service_1 = require("./services/automation.service");
const channel_service_1 = require("./services/channel.service");
const scheduler_service_1 = require("./services/scheduler.service");
const dto_1 = require("./dto");
const client_1 = require("@prisma/client");
let CommunicationController = class CommunicationController {
    messageService;
    templateService;
    automationService;
    channelService;
    schedulerService;
    constructor(messageService, templateService, automationService, channelService, schedulerService) {
        this.messageService = messageService;
        this.templateService = templateService;
        this.automationService = automationService;
        this.channelService = channelService;
        this.schedulerService = schedulerService;
    }
    async getStats(req) {
        return this.messageService.getStats(req.user.tenantId);
    }
    async listMessages(req, filters) {
        return this.messageService.findAll(req.user.tenantId, filters);
    }
    async getMessage(req, id) {
        return this.messageService.findOne(req.user.tenantId, id);
    }
    async sendMessage(req, dto) {
        return this.messageService.send(req.user.tenantId, dto, req.user.id);
    }
    async scheduleMessage(req, dto) {
        return this.messageService.schedule(req.user.tenantId, dto, req.user.id);
    }
    async cancelScheduled(req, id) {
        return this.messageService.cancelScheduled(req.user.tenantId, id);
    }
    async retryMessage(req, id) {
        return this.messageService.retry(req.user.tenantId, id);
    }
    async getUpcomingScheduled(req, limit) {
        return this.schedulerService.getUpcoming(req.user.tenantId, limit);
    }
    async listTemplates(req, channel, category) {
        return this.templateService.findAll(req.user.tenantId, channel, category);
    }
    getAvailableVariables() {
        return this.templateService.getAvailableVariables();
    }
    async getTemplate(req, id) {
        return this.templateService.findOne(req.user.tenantId, id);
    }
    async createTemplate(req, dto) {
        return this.templateService.create(req.user.tenantId, dto, req.user.id);
    }
    async updateTemplate(req, id, dto) {
        return this.templateService.update(req.user.tenantId, id, dto);
    }
    async getTemplateVersions(req, id) {
        const template = await this.templateService.findOne(req.user.tenantId, id);
        return this.templateService.getVersions(req.user.tenantId, template.name, template.channel);
    }
    async deleteTemplate(req, id) {
        return this.templateService.delete(req.user.tenantId, id);
    }
    async previewTemplate(req, id, dto) {
        const template = await this.templateService.findOne(req.user.tenantId, id);
        return this.templateService.preview({ subject: template.subject ?? undefined, body: template.body }, dto.context);
    }
    async duplicateTemplate(req, id, newName) {
        return this.templateService.duplicate(req.user.tenantId, id, newName);
    }
    async listAutomations(req) {
        return this.automationService.findAll(req.user.tenantId);
    }
    getAvailableTriggers() {
        return this.automationService.getAvailableTriggers();
    }
    async getAutomation(req, id) {
        return this.automationService.findOne(req.user.tenantId, id);
    }
    async createAutomation(req, dto) {
        return this.automationService.create(req.user.tenantId, dto, req.user.id);
    }
    async updateAutomation(req, id, dto) {
        return this.automationService.update(req.user.tenantId, id, dto);
    }
    async deleteAutomation(req, id) {
        return this.automationService.delete(req.user.tenantId, id);
    }
    async toggleAutomation(req, id) {
        return this.automationService.toggle(req.user.tenantId, id);
    }
    async listChannels(req) {
        return this.channelService.findAll(req.user.tenantId);
    }
    async getChannel(req, channel) {
        return this.channelService.findOne(req.user.tenantId, channel);
    }
    async updateChannel(req, dto) {
        return this.channelService.upsert(req.user.tenantId, dto);
    }
    async testChannel(req, channel) {
        return this.channelService.test(req.user.tenantId, channel);
    }
    async deleteChannel(req, channel) {
        return this.channelService.delete(req.user.tenantId, channel);
    }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get communication stats overview' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'List messages with filters' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.MessageFilterDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Get)('messages/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get message details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getMessage", null);
__decorate([
    (0, common_1.Post)('messages/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send immediate message' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('messages/schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule future message' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ScheduleMessageDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "scheduleMessage", null);
__decorate([
    (0, common_1.Delete)('messages/scheduled/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel scheduled message' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "cancelScheduled", null);
__decorate([
    (0, common_1.Post)('messages/:id/retry'),
    (0, swagger_1.ApiOperation)({ summary: 'Retry failed message' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "retryMessage", null);
__decorate([
    (0, common_1.Get)('messages/scheduled/upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming scheduled messages' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getUpcomingScheduled", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'List message templates' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('channel')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "listTemplates", null);
__decorate([
    (0, common_1.Get)('templates/variables'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available template variables' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getAvailableVariables", null);
__decorate([
    (0, common_1.Get)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Get)('templates/:id/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template version history' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getTemplateVersions", null);
__decorate([
    (0, common_1.Delete)('templates/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview template with sample data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.PreviewTemplateDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "previewTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate template' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "duplicateTemplate", null);
__decorate([
    (0, common_1.Get)('automations'),
    (0, swagger_1.ApiOperation)({ summary: 'List automation rules' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "listAutomations", null);
__decorate([
    (0, common_1.Get)('automations/triggers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available automation triggers' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getAvailableTriggers", null);
__decorate([
    (0, common_1.Get)('automations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get automation rule details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getAutomation", null);
__decorate([
    (0, common_1.Post)('automations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create automation rule' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateAutomationDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "createAutomation", null);
__decorate([
    (0, common_1.Put)('automations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update automation rule' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateAutomationDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "updateAutomation", null);
__decorate([
    (0, common_1.Delete)('automations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete automation rule' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "deleteAutomation", null);
__decorate([
    (0, common_1.Patch)('automations/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle automation rule on/off' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "toggleAutomation", null);
__decorate([
    (0, common_1.Get)('channels'),
    (0, swagger_1.ApiOperation)({ summary: 'List configured channels' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "listChannels", null);
__decorate([
    (0, common_1.Get)('channels/:channel'),
    (0, swagger_1.ApiOperation)({ summary: 'Get channel configuration' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getChannel", null);
__decorate([
    (0, common_1.Put)('channels/:channel'),
    (0, swagger_1.ApiOperation)({ summary: 'Update channel configuration' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.ChannelConfigDto]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "updateChannel", null);
__decorate([
    (0, common_1.Post)('channels/:channel/test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test channel connection' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "testChannel", null);
__decorate([
    (0, common_1.Delete)('channels/:channel'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove channel configuration' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "deleteChannel", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, swagger_1.ApiTags)('Communication'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('api/v1/communication'),
    __metadata("design:paramtypes", [message_service_1.MessageService,
        template_service_1.TemplateService,
        automation_service_1.AutomationService,
        channel_service_1.ChannelService,
        scheduler_service_1.SchedulerService])
], CommunicationController);
//# sourceMappingURL=communication.controller.js.map