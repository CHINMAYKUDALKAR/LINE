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
exports.ExportFormat = exports.ScheduledReportResponseDto = exports.CreateScheduledReportDto = exports.ScheduleFrequency = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
var ReportType;
(function (ReportType) {
    ReportType["OVERVIEW"] = "overview";
    ReportType["FUNNEL"] = "funnel";
    ReportType["TIME_TO_HIRE"] = "time-to-hire";
    ReportType["INTERVIEWER_LOAD"] = "interviewer-load";
    ReportType["SOURCE_PERFORMANCE"] = "source-performance";
    ReportType["STAGE_METRICS"] = "stage-metrics";
})(ReportType || (exports.ReportType = ReportType = {}));
var ScheduleFrequency;
(function (ScheduleFrequency) {
    ScheduleFrequency["DAILY"] = "daily";
    ScheduleFrequency["WEEKLY"] = "weekly";
    ScheduleFrequency["MONTHLY"] = "monthly";
})(ScheduleFrequency || (exports.ScheduleFrequency = ScheduleFrequency = {}));
class CreateScheduledReportDto {
    reportType;
    frequency;
    recipients;
    dayOfWeek;
    dayOfMonth;
    time;
    name;
}
exports.CreateScheduledReportDto = CreateScheduledReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of report to schedule', enum: ReportType }),
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], CreateScheduledReportDto.prototype, "reportType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Frequency of report delivery', enum: ScheduleFrequency }),
    (0, class_validator_1.IsEnum)(ScheduleFrequency),
    __metadata("design:type", String)
], CreateScheduledReportDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email addresses to send report to', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEmail)({}, { each: true }),
    __metadata("design:type", Array)
], CreateScheduledReportDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day of week for weekly reports (0=Sunday, 6=Saturday)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateScheduledReportDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day of month for monthly reports (1-28)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(28),
    __metadata("design:type", Number)
], CreateScheduledReportDto.prototype, "dayOfMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time to send report (HH:mm format)', example: '09:00' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Time must be in HH:mm format' }),
    __metadata("design:type", String)
], CreateScheduledReportDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Report name/description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScheduledReportDto.prototype, "name", void 0);
class ScheduledReportResponseDto {
    id;
    tenantId;
    reportType;
    frequency;
    recipients;
    dayOfWeek;
    dayOfMonth;
    time;
    name;
    isActive;
    lastRunAt;
    nextRunAt;
    createdAt;
    createdById;
}
exports.ScheduledReportResponseDto = ScheduledReportResponseDto;
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["CSV"] = "csv";
    ExportFormat["PDF"] = "pdf";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
//# sourceMappingURL=scheduled-report.dto.js.map