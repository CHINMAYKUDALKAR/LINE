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
exports.SubmitFeedbackDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitFeedbackDto {
    interviewId;
    rating;
    criteria;
    comments;
}
exports.SubmitFeedbackDto = SubmitFeedbackDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the interview to submit feedback for', example: 'int_abc123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitFeedbackDto.prototype, "interviewId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Overall rating (1-5 scale)', example: 4, minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], SubmitFeedbackDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed criteria ratings',
        example: { communication: 4, problemSolving: 5, technicalSkills: 4 }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SubmitFeedbackDto.prototype, "criteria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional comments or notes', example: 'Strong candidate with good communication skills' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitFeedbackDto.prototype, "comments", void 0);
//# sourceMappingURL=submit-feedback.dto.js.map