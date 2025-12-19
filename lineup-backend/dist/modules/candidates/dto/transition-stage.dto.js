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
exports.StageHistoryEntryDto = exports.StageTransitionResponseDto = exports.RejectCandidateDto = exports.TransitionStageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TransitionStageDto {
    newStage;
    reason;
    allowOverride;
}
exports.TransitionStageDto = TransitionStageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target stage key (e.g., SCREENING, INTERVIEW_1)',
        example: 'INTERVIEW_1'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransitionStageDto.prototype, "newStage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for transition (required for override/backward transitions)',
        example: 'Moving to technical round after screening passed'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransitionStageDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Allow override of stage ordering rules (ADMIN only)',
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TransitionStageDto.prototype, "allowOverride", void 0);
class RejectCandidateDto {
    reason;
}
exports.RejectCandidateDto = RejectCandidateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rejection reason (required, minimum 3 characters)',
        example: 'Candidate did not meet technical requirements'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], RejectCandidateDto.prototype, "reason", void 0);
class StageTransitionResponseDto {
    success;
    candidateId;
    previousStage;
    newStage;
    transitionType;
    warnings;
}
exports.StageTransitionResponseDto = StageTransitionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the transition was successful' }),
    __metadata("design:type", Boolean)
], StageTransitionResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Candidate ID' }),
    __metadata("design:type", String)
], StageTransitionResponseDto.prototype, "candidateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stage before transition' }),
    __metadata("design:type", String)
], StageTransitionResponseDto.prototype, "previousStage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New stage after transition' }),
    __metadata("design:type", String)
], StageTransitionResponseDto.prototype, "newStage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of transition',
        enum: ['FORWARD', 'BACKWARD', 'TERMINAL', 'OVERRIDE', 'SAME']
    }),
    __metadata("design:type", String)
], StageTransitionResponseDto.prototype, "transitionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Warnings about the transition',
        type: [String]
    }),
    __metadata("design:type", Array)
], StageTransitionResponseDto.prototype, "warnings", void 0);
class StageHistoryEntryDto {
    id;
    previousStage;
    newStage;
    source;
    triggeredBy;
    actor;
    reason;
    createdAt;
}
exports.StageHistoryEntryDto = StageHistoryEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'History entry ID' }),
    __metadata("design:type", String)
], StageHistoryEntryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stage before transition' }),
    __metadata("design:type", String)
], StageHistoryEntryDto.prototype, "previousStage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stage after transition' }),
    __metadata("design:type", String)
], StageHistoryEntryDto.prototype, "newStage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source of transition',
        enum: ['SYSTEM', 'USER']
    }),
    __metadata("design:type", String)
], StageHistoryEntryDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'What triggered the transition',
        example: 'INTERVIEW_SCHEDULED'
    }),
    __metadata("design:type", String)
], StageHistoryEntryDto.prototype, "triggeredBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User who initiated the transition' }),
    __metadata("design:type", Object)
], StageHistoryEntryDto.prototype, "actor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for transition' }),
    __metadata("design:type", String)
], StageHistoryEntryDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of transition' }),
    __metadata("design:type", Date)
], StageHistoryEntryDto.prototype, "createdAt", void 0);
//# sourceMappingURL=transition-stage.dto.js.map