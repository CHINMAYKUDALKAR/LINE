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
exports.RescheduleResponseDto = exports.ConflictInfoDto = exports.RescheduleInterviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RescheduleInterviewDto {
    newStartAt;
    newDurationMins;
}
exports.RescheduleInterviewDto = RescheduleInterviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New start date/time for the interview (ISO 8601)',
        example: '2025-01-15T10:00:00Z'
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RescheduleInterviewDto.prototype, "newStartAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New duration in minutes',
        example: 60,
        minimum: 15
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    __metadata("design:type", Number)
], RescheduleInterviewDto.prototype, "newDurationMins", void 0);
class ConflictInfoDto {
    interviewId;
    date;
    duration;
    stage;
}
exports.ConflictInfoDto = ConflictInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflicting interview ID' }),
    __metadata("design:type", String)
], ConflictInfoDto.prototype, "interviewId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflicting interview date' }),
    __metadata("design:type", Date)
], ConflictInfoDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Conflicting interview duration in minutes' }),
    __metadata("design:type", Number)
], ConflictInfoDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interview stage' }),
    __metadata("design:type", String)
], ConflictInfoDto.prototype, "stage", void 0);
class RescheduleResponseDto {
    interview;
    conflicts;
    hasConflicts;
    message;
}
exports.RescheduleResponseDto = RescheduleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated interview details' }),
    __metadata("design:type", Object)
], RescheduleResponseDto.prototype, "interview", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Conflict warnings (does not block the operation)',
        type: [ConflictInfoDto]
    }),
    __metadata("design:type", Array)
], RescheduleResponseDto.prototype, "conflicts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether conflicts were detected' }),
    __metadata("design:type", Boolean)
], RescheduleResponseDto.prototype, "hasConflicts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Human-readable result message',
        example: 'Interview rescheduled successfully'
    }),
    __metadata("design:type", String)
], RescheduleResponseDto.prototype, "message", void 0);
//# sourceMappingURL=reschedule-interview.dto.js.map