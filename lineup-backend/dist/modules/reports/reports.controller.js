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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const scheduled_report_dto_1 = require("./dto/scheduled-report.dto");
const rate_limit_1 = require("../../common/rate-limit");
const get_report_dto_1 = require("./dto/get-report.dto");
const dashboard_summary_dto_1 = require("./dto/dashboard-summary.dto");
let ReportsController = class ReportsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    summary(req) {
        return this.svc.getDashboardSummary(req.user.tenantId);
    }
    overview(req, refresh) {
        return this.svc.overview(req.user.tenantId, refresh === 'true');
    }
    funnel(req, filters, refresh) {
        return this.svc.funnel(req.user.tenantId, filters, refresh === 'true');
    }
    timeToHire(req, filters, refresh) {
        return this.svc.timeToHire(req.user.tenantId, filters, refresh === 'true');
    }
    interviewerLoad(req, filters, refresh) {
        return this.svc.interviewerLoad(req.user.tenantId, filters, refresh === 'true');
    }
    sourcePerformance(req, filters, refresh) {
        return this.svc.sourcePerformance(req.user.tenantId, filters, refresh === 'true');
    }
    async exportCsv(req, res, type, filters) {
        const { filename, content } = await this.svc.exportToCsv(req.user.tenantId, type, filters);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(content);
    }
    async exportPdf(req, res, type, filters) {
        const { filename, html } = await this.svc.exportToPdf(req.user.tenantId, type, filters);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('X-Filename', filename);
        res.send(html);
    }
    createSchedule(req, dto) {
        return this.svc.createScheduledReport(req.user.tenantId, req.user.sub, dto);
    }
    listSchedules(req) {
        return this.svc.listScheduledReports(req.user.tenantId);
    }
    getSchedule(req, id) {
        return this.svc.getScheduledReport(req.user.tenantId, id);
    }
    deleteSchedule(req, id) {
        return this.svc.deleteScheduledReport(req.user.tenantId, req.user.sub, id);
    }
    toggleSchedule(req, id) {
        return this.svc.toggleScheduledReport(req.user.tenantId, req.user.sub, id);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard summary metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: dashboard_summary_dto_1.DashboardSummaryDto }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get overview report with funnel, time-to-hire, and interviewer load' }),
    (0, swagger_1.ApiQuery)({ name: 'refresh', required: false, description: 'Force refresh cached data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Overview report data' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('funnel'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get candidate funnel/stage breakdown' }),
    (0, swagger_1.ApiQuery)({ name: 'refresh', required: false, description: 'Force refresh cached data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Funnel data by hiring stage' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_report_dto_1.GetReportDto, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "funnel", null);
__decorate([
    (0, common_1.Get)('time-to-hire'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get average time-to-hire metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'refresh', required: false, description: 'Force refresh cached data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Time-to-hire statistics' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_report_dto_1.GetReportDto, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "timeToHire", null);
__decorate([
    (0, common_1.Get)('interviewer-load'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get interviewer workload distribution' }),
    (0, swagger_1.ApiQuery)({ name: 'refresh', required: false, description: 'Force refresh cached data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interviewer load metrics per user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_report_dto_1.GetReportDto, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "interviewerLoad", null);
__decorate([
    (0, common_1.Get)('source-performance'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get source effectiveness report' }),
    (0, swagger_1.ApiQuery)({ name: 'refresh', required: false, description: 'Force refresh cached data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Source performance metrics' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('refresh')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_report_dto_1.GetReportDto, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "sourcePerformance", null);
__decorate([
    (0, common_1.Get)('export/csv/:type'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Export report as CSV file' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: scheduled_report_dto_1.ReportType }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('type')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, get_report_dto_1.GetReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf/:type'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Export report as PDF (returns HTML for client-side PDF generation)' }),
    (0, swagger_1.ApiParam)({ name: 'type', enum: scheduled_report_dto_1.ReportType }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('type')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, get_report_dto_1.GetReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Post)('schedules'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a scheduled report' }),
    (0, swagger_1.ApiBody)({ type: scheduled_report_dto_1.CreateScheduledReportDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Scheduled report created' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scheduled_report_dto_1.CreateScheduledReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Get)('schedules'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'List all scheduled reports for tenant' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "listSchedules", null);
__decorate([
    (0, common_1.Get)('schedules/:id'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific scheduled report' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Delete)('schedules/:id'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a scheduled report' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.Post)('schedules/:id/toggle'),
    (0, roles_decorator_1.Roles)('MANAGER', 'ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle scheduled report active/inactive' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "toggleSchedule", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/reports'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, rate_limit_1.RateLimited)(rate_limit_1.RateLimitProfile.REPORT),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map