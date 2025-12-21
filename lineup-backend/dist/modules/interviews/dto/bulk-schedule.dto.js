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
exports.BulkScheduleDto = exports.BulkScheduleStrategy = exports.BulkMode = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var BulkMode;
(function (BulkMode) {
    BulkMode["SEQUENTIAL"] = "SEQUENTIAL";
    BulkMode["GROUP"] = "GROUP";
})(BulkMode || (exports.BulkMode = BulkMode = {}));
var BulkScheduleStrategy;
(function (BulkScheduleStrategy) {
    BulkScheduleStrategy["AUTO"] = "AUTO";
    BulkScheduleStrategy["SAME_TIME"] = "SAME_TIME";
    BulkScheduleStrategy["PER_CANDIDATE"] = "PER_CANDIDATE";
})(BulkScheduleStrategy || (exports.BulkScheduleStrategy = BulkScheduleStrategy = {}));
class BulkScheduleDto {
    candidateIds;
    interviewerIds;
    durationMins;
    bulkMode;
    startTime;
    stage;
    timezone;
    strategy;
    scheduledTime;
}
exports.BulkScheduleDto = BulkScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of candidate IDs to schedule',
        example: ['cand_123', 'cand_456', 'cand_789'],
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkScheduleDto.prototype, "candidateIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of interviewer user IDs',
        example: ['user_abc', 'user_def'],
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkScheduleDto.prototype, "interviewerIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interview duration in minutes (min 15)', example: 60, minimum: 15 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    __metadata("design:type", Number)
], BulkScheduleDto.prototype, "durationMins", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bulk scheduling mode - REQUIRED. SEQUENTIAL creates one interview per candidate with staggered times. GROUP creates one interview for all candidates at same time.',
        enum: BulkMode,
        example: BulkMode.SEQUENTIAL
    }),
    (0, class_validator_1.IsEnum)(BulkMode),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "bulkMode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time for the first interview (ISO 8601). For SEQUENTIAL, subsequent interviews are offset by duration.',
        example: '2024-01-15T14:00:00Z'
    }),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Interview stage/round', example: 'Technical Round' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timezone for scheduling', example: 'Asia/Kolkata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BulkScheduleStrategy),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "strategy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], BulkScheduleDto.prototype, "scheduledTime", void 0);
//# sourceMappingURL=bulk-schedule.dto.js.map