import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    Body,
    UseGuards,
    Res,
    Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsageService } from './usage.service';
import type { TenantPlan } from './usage.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/admin/usage')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class UsageController {
    constructor(private usageService: UsageService) { }

    /**
     * GET /api/v1/admin/usage/:tenantId/monthly
     * Get monthly usage summary for a tenant
     */
    @Get(':tenantId/monthly')
    async getMonthlyUsage(
        @Param('tenantId') tenantId: string,
        @Query('month') month?: string,
    ) {
        const targetMonth = month || this.getCurrentMonth();
        return this.usageService.getMonthlyUsage(tenantId, targetMonth);
    }

    /**
     * GET /api/v1/admin/usage/:tenantId/history
     * Get usage history for last N months
     */
    @Get(':tenantId/history')
    async getUsageHistory(
        @Param('tenantId') tenantId: string,
        @Query('months') months?: string,
    ) {
        return this.usageService.getUsageHistory(tenantId, parseInt(months || '6'));
    }

    /**
     * GET /api/v1/admin/usage/:tenantId/plan
     * Get tenant plan metadata
     */
    @Get(':tenantId/plan')
    async getTenantPlan(@Param('tenantId') tenantId: string) {
        return this.usageService.getTenantPlan(tenantId);
    }

    /**
     * PATCH /api/v1/admin/usage/:tenantId/plan
     * Update tenant plan (no enforcement)
     */
    @Patch(':tenantId/plan')
    @Roles('SUPERADMIN')
    async updateTenantPlan(
        @Param('tenantId') tenantId: string,
        @Body() plan: TenantPlan,
    ) {
        return this.usageService.updateTenantPlan(tenantId, plan);
    }

    /**
     * GET /api/v1/admin/usage/:tenantId/export
     * Export usage data as CSV
     */
    @Get(':tenantId/export')
    @Header('Content-Type', 'text/csv')
    async exportUsage(
        @Param('tenantId') tenantId: string,
        @Res() res: Response,
        @Query('months') months?: string,
    ) {
        const csv = await this.usageService.exportUsageCsv(
            tenantId,
            parseInt(months || '12'),
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="usage-${tenantId}-${this.getCurrentMonth()}.csv"`,
        );
        res.send(csv);
    }

    /**
     * GET /api/v1/admin/usage/all
     * Get usage summary for all tenants (current month)
     */
    @Get('all')
    @Roles('SUPERADMIN')
    async getAllTenantsUsage(@Query('month') month?: string) {
        const targetMonth = month || this.getCurrentMonth();
        return this.usageService.getAllTenantsUsage(targetMonth);
    }

    private getCurrentMonth(): string {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}
