import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/feedback')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FeedbackController {
    constructor(private svc: FeedbackService) { }

    @Post()
    @Roles('INTERVIEWER', 'RECRUITER', 'MANAGER', 'ADMIN')
    submit(@Req() req: any, @Body() dto: SubmitFeedbackDto) {
        return this.svc.submitFeedback(req.user.tenantId, req.user.sub, dto);
    }

    @Get('interview/:id')
    @Roles('RECRUITER', 'MANAGER', 'ADMIN')
    getForInterview(@Req() req: any, @Param('id') id: string) {
        return this.svc.getInterviewFeedback(req.user.tenantId, id);
    }
}