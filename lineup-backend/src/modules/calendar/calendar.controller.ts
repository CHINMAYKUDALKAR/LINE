import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RateLimited, RateLimitProfile } from '../../common/rate-limit';
import {
    AvailabilityService,
    BusyBlockService,
    CalendarSyncService,
    GoogleCalendarOAuthService,
    MicrosoftCalendarOAuthService,
    SchedulingRulesService,
    SlotService,
    SuggestionService,
    WorkingHoursService,
} from './services';
import {
    AvailabilityQueryDto,
    CalendarCallbackDto,
    CalendarConnectDto,
    ToggleSyncDto,
    CreateBusyBlockDto,
    BusyBlockQueryDto,
    CreateSchedulingRuleDto,
    UpdateSchedulingRuleDto,
    CreateSlotDto,
    GenerateSlotsDto,
    BookSlotDto,
    RescheduleSlotDto,
    SlotQueryDto,
    SetWorkingHoursDto,
    SuggestionQueryDto,
    TeamAvailabilityQueryDto,
} from './dto';

@Controller('api/v1/calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
    constructor(
        private availabilityService: AvailabilityService,
        private busyBlockService: BusyBlockService,
        private calendarSyncService: CalendarSyncService,
        private googleOAuth: GoogleCalendarOAuthService,
        private microsoftOAuth: MicrosoftCalendarOAuthService,
        private schedulingRulesService: SchedulingRulesService,
        private slotService: SlotService,
        private suggestionService: SuggestionService,
        private workingHoursService: WorkingHoursService,
    ) { }


    // ==================== Availability ====================

    @Get('availability')
    @RateLimited(RateLimitProfile.CALENDAR)
    async getAvailability(@Req() req: any, @Query() query: AvailabilityQueryDto) {
        const tenantId = req.tenantId;
        const userIds = Array.isArray(query.userIds)
            ? query.userIds
            : [query.userIds];

        const start = new Date(query.start);
        const end = new Date(query.end);
        const durationMins = query.durationMins || 60;

        return this.availabilityService.getMultiUserAvailability(
            tenantId,
            userIds,
            start,
            end,
            durationMins,
        );
    }

    // ==================== Suggestions & Team Availability ====================

    @Post('suggestions')
    @RateLimited(RateLimitProfile.CALENDAR)
    async getSuggestions(@Req() req: any, @Body() dto: SuggestionQueryDto) {
        return this.suggestionService.getSuggestions(req.tenantId, dto);
    }

    @Get('team-availability')
    @RateLimited(RateLimitProfile.CALENDAR)
    async getTeamAvailability(@Req() req: any, @Query() query: TeamAvailabilityQueryDto) {
        return this.suggestionService.getTeamAvailability(req.tenantId, query);
    }

    // ==================== Slots ====================

    @Get('slots')
    async getSlots(@Req() req: any, @Query() query: SlotQueryDto) {
        return this.slotService.getSlots(req.tenantId, query);
    }

    @Get('slots/:id')
    async getSlot(@Req() req: any, @Param('id') id: string) {
        return this.slotService.getSlot(req.tenantId, id);
    }

    @Post('slots')
    @UseGuards(RbacGuard)
    @Roles('RECRUITER', 'MANAGER', 'ADMIN')
    async createSlot(@Req() req: any, @Body() dto: CreateSlotDto) {
        return this.slotService.createSlot(req.tenantId, req.user.sub, dto);
    }

    @Post('slots/generate')
    @UseGuards(RbacGuard)
    @Roles('RECRUITER', 'MANAGER', 'ADMIN')
    async generateSlots(@Req() req: any, @Body() dto: GenerateSlotsDto) {
        return this.slotService.generateSlots(req.tenantId, req.user.sub, dto);
    }

    @Post('slots/:id/book')
    async bookSlot(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: BookSlotDto,
    ) {
        return this.slotService.bookSlot(req.tenantId, id, req.user.sub, dto);
    }

    @Patch('slots/:id/reschedule')
    async rescheduleSlot(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: RescheduleSlotDto,
    ) {
        return this.slotService.rescheduleSlot(req.tenantId, id, req.user.sub, dto);
    }

    @Post('slots/:id/cancel')
    async cancelSlot(@Req() req: any, @Param('id') id: string) {
        return this.slotService.cancelSlot(req.tenantId, id, req.user.sub);
    }

    // ==================== Working Hours ====================

    @Get('working-hours')
    async getWorkingHours(@Req() req: any, @Query('userId') userId?: string) {
        const targetUserId = userId || req.user.sub;
        return this.workingHoursService.getWorkingHours(req.tenantId, targetUserId);
    }

    @Put('working-hours')
    async setWorkingHours(@Req() req: any, @Body() dto: SetWorkingHoursDto) {
        return this.workingHoursService.setWorkingHours(
            req.tenantId,
            req.user.sub,
            dto,
        );
    }

    // ==================== Busy Blocks ====================

    @Get('busy-blocks')
    async getBusyBlocks(@Req() req: any, @Query() query: BusyBlockQueryDto) {
        return this.busyBlockService.getBusyBlocks(req.tenantId, query);
    }

    @Post('busy-blocks')
    async createBusyBlock(@Req() req: any, @Body() dto: CreateBusyBlockDto) {
        return this.busyBlockService.createBusyBlock(
            req.tenantId,
            req.user.sub,
            dto,
        );
    }

    @Delete('busy-blocks/:id')
    async deleteBusyBlock(@Req() req: any, @Param('id') id: string) {
        return this.busyBlockService.deleteBusyBlock(
            req.tenantId,
            req.user.sub,
            id,
        );
    }

    // ==================== Scheduling Rules ====================

    @Get('rules')
    async getRules(@Req() req: any) {
        return this.schedulingRulesService.getRules(req.tenantId);
    }

    @Get('rules/:id')
    async getRule(@Req() req: any, @Param('id') id: string) {
        return this.schedulingRulesService.getRule(req.tenantId, id);
    }

    @Post('rules')
    @UseGuards(RbacGuard)
    @Roles('ADMIN')
    async createRule(@Req() req: any, @Body() dto: CreateSchedulingRuleDto) {
        return this.schedulingRulesService.createRule(
            req.tenantId,
            req.user.sub,
            dto,
        );
    }

    @Put('rules/:id')
    @UseGuards(RbacGuard)
    @Roles('ADMIN')
    async updateRule(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateSchedulingRuleDto,
    ) {
        return this.schedulingRulesService.updateRule(req.tenantId, id, dto);
    }

    @Delete('rules/:id')
    @UseGuards(RbacGuard)
    @Roles('ADMIN')
    async deleteRule(@Req() req: any, @Param('id') id: string) {
        return this.schedulingRulesService.deleteRule(req.tenantId, id);
    }

    // ==================== Calendar Sync ====================

    @Get('sync/accounts')
    async getConnectedAccounts(@Req() req: any) {
        const accounts = await this.calendarSyncService.getConnectedAccounts(
            req.tenantId,
            req.user.id,
        );
        return { accounts };
    }

    @Get('sync/google/auth-url')
    async getGoogleAuthUrl(@Req() req: any, @Query() dto: CalendarConnectDto) {
        const authUrl = this.googleOAuth.getAuthUrl(
            req.tenantId,
            req.user.id,
            dto.redirectUri,
        );
        return { authUrl };
    }

    @Post('sync/google/callback')
    async googleCallback(@Req() req: any, @Body() dto: CalendarCallbackDto) {
        return this.googleOAuth.exchangeCode(
            req.tenantId,
            req.user.id,
            dto.code,
            dto.redirectUri,
        );
    }

    @Delete('sync/google')
    async disconnectGoogle(@Req() req: any) {
        await this.googleOAuth.disconnect(req.tenantId, req.user.id);
        return { success: true };
    }

    @Get('sync/microsoft/auth-url')
    async getMicrosoftAuthUrl(@Req() req: any, @Query() dto: CalendarConnectDto) {
        const authUrl = this.microsoftOAuth.getAuthUrl(
            req.tenantId,
            req.user.id,
            dto.redirectUri,
        );
        return { authUrl };
    }

    @Post('sync/microsoft/callback')
    async microsoftCallback(@Req() req: any, @Body() dto: CalendarCallbackDto) {
        return this.microsoftOAuth.exchangeCode(
            req.tenantId,
            req.user.id,
            dto.code,
            dto.redirectUri,
        );
    }

    @Delete('sync/microsoft')
    async disconnectMicrosoft(@Req() req: any) {
        await this.microsoftOAuth.disconnect(req.tenantId, req.user.id);
        return { success: true };
    }

    @Post('sync/:accountId/sync')
    async syncCalendar(@Param('accountId') accountId: string) {
        const result = await this.calendarSyncService.syncCalendar(accountId);
        return { success: true, eventsProcessed: result.eventsProcessed };
    }

    @Patch('sync/:accountId/toggle')
    async toggleSync(
        @Param('accountId') accountId: string,
        @Body() dto: ToggleSyncDto,
    ) {
        await this.calendarSyncService.toggleSyncEnabled(accountId, dto.enabled);
        return { success: true };
    }
}
