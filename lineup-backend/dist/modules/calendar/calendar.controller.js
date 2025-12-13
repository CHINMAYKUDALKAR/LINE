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
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const services_1 = require("./services");
const dto_1 = require("./dto");
let CalendarController = class CalendarController {
    availabilityService;
    busyBlockService;
    calendarSyncService;
    googleOAuth;
    microsoftOAuth;
    schedulingRulesService;
    slotService;
    suggestionService;
    workingHoursService;
    constructor(availabilityService, busyBlockService, calendarSyncService, googleOAuth, microsoftOAuth, schedulingRulesService, slotService, suggestionService, workingHoursService) {
        this.availabilityService = availabilityService;
        this.busyBlockService = busyBlockService;
        this.calendarSyncService = calendarSyncService;
        this.googleOAuth = googleOAuth;
        this.microsoftOAuth = microsoftOAuth;
        this.schedulingRulesService = schedulingRulesService;
        this.slotService = slotService;
        this.suggestionService = suggestionService;
        this.workingHoursService = workingHoursService;
    }
    async getAvailability(req, query) {
        const tenantId = req.tenantId;
        const userIds = Array.isArray(query.userIds)
            ? query.userIds
            : [query.userIds];
        const start = new Date(query.start);
        const end = new Date(query.end);
        const durationMins = query.durationMins || 60;
        return this.availabilityService.getMultiUserAvailability(tenantId, userIds, start, end, durationMins);
    }
    async getSuggestions(req, dto) {
        return this.suggestionService.getSuggestions(req.tenantId, dto);
    }
    async getTeamAvailability(req, query) {
        return this.suggestionService.getTeamAvailability(req.tenantId, query);
    }
    async getSlots(req, query) {
        return this.slotService.getSlots(req.tenantId, query);
    }
    async getSlot(req, id) {
        return this.slotService.getSlot(req.tenantId, id);
    }
    async createSlot(req, dto) {
        return this.slotService.createSlot(req.tenantId, req.user.sub, dto);
    }
    async generateSlots(req, dto) {
        return this.slotService.generateSlots(req.tenantId, req.user.sub, dto);
    }
    async bookSlot(req, id, dto) {
        return this.slotService.bookSlot(req.tenantId, id, req.user.sub, dto);
    }
    async rescheduleSlot(req, id, dto) {
        return this.slotService.rescheduleSlot(req.tenantId, id, req.user.sub, dto);
    }
    async cancelSlot(req, id) {
        return this.slotService.cancelSlot(req.tenantId, id, req.user.sub);
    }
    async getWorkingHours(req, userId) {
        const targetUserId = userId || req.user.sub;
        return this.workingHoursService.getWorkingHours(req.tenantId, targetUserId);
    }
    async setWorkingHours(req, dto) {
        return this.workingHoursService.setWorkingHours(req.tenantId, req.user.sub, dto);
    }
    async getBusyBlocks(req, query) {
        return this.busyBlockService.getBusyBlocks(req.tenantId, query);
    }
    async createBusyBlock(req, dto) {
        return this.busyBlockService.createBusyBlock(req.tenantId, req.user.sub, dto);
    }
    async deleteBusyBlock(req, id) {
        return this.busyBlockService.deleteBusyBlock(req.tenantId, req.user.sub, id);
    }
    async getRules(req) {
        return this.schedulingRulesService.getRules(req.tenantId);
    }
    async getRule(req, id) {
        return this.schedulingRulesService.getRule(req.tenantId, id);
    }
    async createRule(req, dto) {
        return this.schedulingRulesService.createRule(req.tenantId, req.user.sub, dto);
    }
    async updateRule(req, id, dto) {
        return this.schedulingRulesService.updateRule(req.tenantId, id, dto);
    }
    async deleteRule(req, id) {
        return this.schedulingRulesService.deleteRule(req.tenantId, id);
    }
    async getConnectedAccounts(req) {
        const accounts = await this.calendarSyncService.getConnectedAccounts(req.tenantId, req.user.id);
        return { accounts };
    }
    async getGoogleAuthUrl(req, dto) {
        const authUrl = this.googleOAuth.getAuthUrl(req.tenantId, req.user.id, dto.redirectUri);
        return { authUrl };
    }
    async googleCallback(req, dto) {
        return this.googleOAuth.exchangeCode(req.tenantId, req.user.id, dto.code, dto.redirectUri);
    }
    async disconnectGoogle(req) {
        await this.googleOAuth.disconnect(req.tenantId, req.user.id);
        return { success: true };
    }
    async getMicrosoftAuthUrl(req, dto) {
        const authUrl = this.microsoftOAuth.getAuthUrl(req.tenantId, req.user.id, dto.redirectUri);
        return { authUrl };
    }
    async microsoftCallback(req, dto) {
        return this.microsoftOAuth.exchangeCode(req.tenantId, req.user.id, dto.code, dto.redirectUri);
    }
    async disconnectMicrosoft(req) {
        await this.microsoftOAuth.disconnect(req.tenantId, req.user.id);
        return { success: true };
    }
    async syncCalendar(accountId) {
        const result = await this.calendarSyncService.syncCalendar(accountId);
        return { success: true, eventsProcessed: result.eventsProcessed };
    }
    async toggleSync(accountId, dto) {
        await this.calendarSyncService.toggleSyncEnabled(accountId, dto.enabled);
        return { success: true };
    }
};
exports.CalendarController = CalendarController;
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.AvailabilityQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Post)('suggestions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SuggestionQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Get)('team-availability'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.TeamAvailabilityQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getTeamAvailability", null);
__decorate([
    (0, common_1.Get)('slots'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SlotQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Get)('slots/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSlot", null);
__decorate([
    (0, common_1.Post)('slots'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('RECRUITER', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateSlotDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createSlot", null);
__decorate([
    (0, common_1.Post)('slots/generate'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('RECRUITER', 'MANAGER', 'ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GenerateSlotsDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "generateSlots", null);
__decorate([
    (0, common_1.Post)('slots/:id/book'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.BookSlotDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "bookSlot", null);
__decorate([
    (0, common_1.Patch)('slots/:id/reschedule'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.RescheduleSlotDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "rescheduleSlot", null);
__decorate([
    (0, common_1.Post)('slots/:id/cancel'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "cancelSlot", null);
__decorate([
    (0, common_1.Get)('working-hours'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getWorkingHours", null);
__decorate([
    (0, common_1.Put)('working-hours'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SetWorkingHoursDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "setWorkingHours", null);
__decorate([
    (0, common_1.Get)('busy-blocks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.BusyBlockQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getBusyBlocks", null);
__decorate([
    (0, common_1.Post)('busy-blocks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateBusyBlockDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createBusyBlock", null);
__decorate([
    (0, common_1.Delete)('busy-blocks/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "deleteBusyBlock", null);
__decorate([
    (0, common_1.Get)('rules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getRule", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateSchedulingRuleDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createRule", null);
__decorate([
    (0, common_1.Put)('rules/:id'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateSchedulingRuleDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    (0, common_1.UseGuards)(rbac_guard_1.RbacGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Get)('sync/accounts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getConnectedAccounts", null);
__decorate([
    (0, common_1.Get)('sync/google/auth-url'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarConnectDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getGoogleAuthUrl", null);
__decorate([
    (0, common_1.Post)('sync/google/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarCallbackDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Delete)('sync/google'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "disconnectGoogle", null);
__decorate([
    (0, common_1.Get)('sync/microsoft/auth-url'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarConnectDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getMicrosoftAuthUrl", null);
__decorate([
    (0, common_1.Post)('sync/microsoft/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarCallbackDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "microsoftCallback", null);
__decorate([
    (0, common_1.Delete)('sync/microsoft'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "disconnectMicrosoft", null);
__decorate([
    (0, common_1.Post)('sync/:accountId/sync'),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "syncCalendar", null);
__decorate([
    (0, common_1.Patch)('sync/:accountId/toggle'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ToggleSyncDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "toggleSync", null);
exports.CalendarController = CalendarController = __decorate([
    (0, common_1.Controller)('api/v1/calendar'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [services_1.AvailabilityService,
        services_1.BusyBlockService,
        services_1.CalendarSyncService,
        services_1.GoogleCalendarOAuthService,
        services_1.MicrosoftCalendarOAuthService,
        services_1.SchedulingRulesService,
        services_1.SlotService,
        services_1.SuggestionService,
        services_1.WorkingHoursService])
], CalendarController);
//# sourceMappingURL=calendar.controller.js.map