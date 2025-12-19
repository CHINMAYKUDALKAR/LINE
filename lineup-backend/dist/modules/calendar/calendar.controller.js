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
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const rate_limit_1 = require("../../common/rate-limit");
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
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.CALENDAR),
    (0, swagger_1.ApiOperation)({ summary: 'Get availability slots for users in a date range' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available time slots for specified users' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid date range or user IDs' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.AvailabilityQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Post)('suggestions'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.CALENDAR),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered scheduling suggestions' }),
    (0, swagger_1.ApiBody)({ type: dto_1.SuggestionQueryDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of optimal scheduling suggestions' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SuggestionQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Get)('team-availability'),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.CALENDAR),
    (0, swagger_1.ApiOperation)({ summary: 'Get team-wide availability overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team availability matrix' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.TeamAvailabilityQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getTeamAvailability", null);
__decorate([
    (0, common_1.Get)('slots'),
    (0, swagger_1.ApiOperation)({ summary: 'List all interview slots' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of interview slots' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SlotQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Get)('slots/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get slot details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Slot ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Slot details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Slot not found' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Create a new interview slot' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateSlotDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Slot created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid slot data' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Auto-generate interview slots based on working hours' }),
    (0, swagger_1.ApiBody)({ type: dto_1.GenerateSlotsDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Slots generated successfully', schema: { example: { generated: 10 } } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GenerateSlotsDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "generateSlots", null);
__decorate([
    (0, common_1.Post)('slots/:id/book'),
    (0, swagger_1.ApiOperation)({ summary: 'Book an interview slot for a candidate' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Slot ID to book' }),
    (0, swagger_1.ApiBody)({ type: dto_1.BookSlotDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Slot booked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Slot not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Slot already booked' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.BookSlotDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "bookSlot", null);
__decorate([
    (0, common_1.Patch)('slots/:id/reschedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Reschedule an existing slot' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Slot ID to reschedule' }),
    (0, swagger_1.ApiBody)({ type: dto_1.RescheduleSlotDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Slot rescheduled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Slot not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.RescheduleSlotDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "rescheduleSlot", null);
__decorate([
    (0, common_1.Post)('slots/:id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a scheduled slot' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Slot ID to cancel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Slot cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Slot not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "cancelSlot", null);
__decorate([
    (0, common_1.Get)('working-hours'),
    (0, swagger_1.ApiOperation)({ summary: 'Get working hours for a user' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'User ID (defaults to current user)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User working hours configuration' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getWorkingHours", null);
__decorate([
    (0, common_1.Put)('working-hours'),
    (0, swagger_1.ApiOperation)({ summary: 'Set working hours for current user' }),
    (0, swagger_1.ApiBody)({ type: dto_1.SetWorkingHoursDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Working hours updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SetWorkingHoursDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "setWorkingHours", null);
__decorate([
    (0, common_1.Get)('busy-blocks'),
    (0, swagger_1.ApiOperation)({ summary: 'List busy blocks (time-off, meetings, etc.)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of busy blocks' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.BusyBlockQueryDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getBusyBlocks", null);
__decorate([
    (0, common_1.Post)('busy-blocks'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a busy block (mark time as unavailable)' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateBusyBlockDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Busy block created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateBusyBlockDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createBusyBlock", null);
__decorate([
    (0, common_1.Delete)('busy-blocks/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a busy block' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Busy block ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Busy block deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Busy block not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "deleteBusyBlock", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'List all scheduling rules for tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of scheduling rules' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scheduling rule by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Rule ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scheduling rule details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rule not found' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Create a new scheduling rule (Admin only)' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateSchedulingRuleDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rule created successfully' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Update a scheduling rule (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Rule ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateSchedulingRuleDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rule updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rule not found' }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Delete a scheduling rule (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Rule ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rule deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Rule not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Get)('sync/accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get connected calendar accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of connected calendar accounts' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getConnectedAccounts", null);
__decorate([
    (0, common_1.Get)('sync/google/auth-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google Calendar OAuth URL' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Google OAuth authorization URL' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarConnectDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getGoogleAuthUrl", null);
__decorate([
    (0, common_1.Post)('sync/google/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Google Calendar OAuth callback' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CalendarCallbackDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Google Calendar connected successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarCallbackDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Delete)('sync/google'),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect Google Calendar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Google Calendar disconnected' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "disconnectGoogle", null);
__decorate([
    (0, common_1.Get)('sync/microsoft/auth-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Microsoft Outlook OAuth URL' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Microsoft OAuth authorization URL' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarConnectDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getMicrosoftAuthUrl", null);
__decorate([
    (0, common_1.Post)('sync/microsoft/callback'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Microsoft Outlook OAuth callback' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CalendarCallbackDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Microsoft Calendar connected successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CalendarCallbackDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "microsoftCallback", null);
__decorate([
    (0, common_1.Delete)('sync/microsoft'),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect Microsoft Outlook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Microsoft Calendar disconnected' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "disconnectMicrosoft", null);
__decorate([
    (0, common_1.Post)('sync/:accountId/sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger manual calendar sync' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Connected account ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync completed', schema: { example: { success: true, eventsProcessed: 15 } } }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "syncCalendar", null);
__decorate([
    (0, common_1.Patch)('sync/:accountId/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable/disable automatic sync for an account' }),
    (0, swagger_1.ApiParam)({ name: 'accountId', description: 'Connected account ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.ToggleSyncDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sync toggled' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ToggleSyncDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "toggleSync", null);
exports.CalendarController = CalendarController = __decorate([
    (0, swagger_1.ApiTags)('calendar'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
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