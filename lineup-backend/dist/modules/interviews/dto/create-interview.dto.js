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
exports.CreateInterviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateInterviewDto {
    candidateId;
    interviewerIds;
    startAt;
    durationMins;
    stage;
    location;
    meetingLink;
    notes;
}
exports.CreateInterviewDto = CreateInterviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the candidate to interview', example: 'cand_abc123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "candidateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of interviewer user IDs', example: ['user_123', 'user_456'], type: [String] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateInterviewDto.prototype, "interviewerIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interview start time in ISO format', example: '2024-01-15T14:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "startAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interview duration in minutes', example: 60 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateInterviewDto.prototype, "durationMins", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interview stage/round', example: 'Technical Round' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Physical location or room', example: 'Conference Room A' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Video meeting link', example: 'https://meet.google.com/abc-xyz' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "meetingLink", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes for interviewers', example: 'Focus on system design' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInterviewDto.prototype, "notes", void 0);
//# sourceMappingURL=create-interview.dto.js.map