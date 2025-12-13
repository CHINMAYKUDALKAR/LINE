import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { ListInterviewsDto } from './dto/list-interviews.dto';
import { BulkScheduleDto } from './dto/bulk-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/interviews')
@UseGuards(JwtAuthGuard, RbacGuard)
export class InterviewsController {
    constructor(private svc: InterviewsService) { }

    @Post()
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    create(@Req() req: any, @Body() dto: CreateInterviewDto) {
        return this.svc.create(req.user.tenantId, req.user.sub, dto);
    }

    @Post('bulk-schedule')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    bulkSchedule(@Req() req: any, @Body() dto: BulkScheduleDto) {
        return this.svc.bulkSchedule(req.user.tenantId, req.user.sub, dto);
    }

    @Post('reschedule/:id')
    // Should ideally be PATCH /:id/reschedule or just update, but following prompt hint "POST /api/v1/interviews/reschedule" 
    // or "POST /api/v1/interviews/:id/reschedule". Prompt says: POST /api/v1/interviews/reschedule (body has interviewId).
    // But RESTful best practice is resource based. Prompt "POST /api/v1/interviews/reschedule".
    // I will support POST /reschedule with body containing ID, OR route Param.
    // Prompt DTO `RescheduleInterviewDto` has `interviewId`.
    // Let's optimize: POST /reschedule (with body) AND PATCH /:id (generic update). 
    // Actually prompt specifically listed: "POST /api/v1/interviews/reschedule" in Section 9.
    // I will implement exactly that.
    createReschedule(@Req() req: any, @Body() dto: RescheduleInterviewDto & { interviewId: string }) {
        return this.svc.reschedule(req.user.tenantId, req.user.sub, dto.interviewId, dto);
    }

    @Get()
    @Roles('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER')
    list(@Req() req: any, @Query() dto: ListInterviewsDto) {
        return this.svc.list(req.user.tenantId, dto);
    }

    @Get(':id')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER')
    get(@Req() req: any, @Param('id') id: string) {
        return this.svc.get(req.user.tenantId, id);
    }

    // Also Prompt mentions: POST /api/v1/interviews/:id/cancel
    @Post(':id/cancel')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    async cancel(@Req() req: any, @Param('id') id: string) {
        return this.svc.cancel(req.user.tenantId, req.user.sub, id);
    }

    @Post(':id/sync-calendar')
    @Roles('ADMIN')
    sync(@Req() req: any, @Param('id') id: string) {
        return { message: 'Sync triggered' };
    }

    @Post(':id/complete')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER', 'INTERVIEWER')
    complete(@Req() req: any, @Param('id') id: string) {
        return this.svc.complete(req.user.tenantId, req.user.sub, id);
    }
}