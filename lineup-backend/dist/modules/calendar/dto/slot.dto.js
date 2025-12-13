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
exports.SlotQueryDto = exports.RescheduleSlotDto = exports.BookSlotDto = exports.GenerateSlotsDto = exports.CreateSlotDto = exports.SlotParticipantDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SlotParticipantDto {
    type;
    id;
    email;
    phone;
    name;
}
exports.SlotParticipantDto = SlotParticipantDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotParticipantDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotParticipantDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotParticipantDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotParticipantDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotParticipantDto.prototype, "name", void 0);
class CreateSlotDto {
    participants;
    startAt;
    endAt;
    timezone;
    metadata;
}
exports.CreateSlotDto = CreateSlotDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SlotParticipantDto),
    __metadata("design:type", Array)
], CreateSlotDto.prototype, "participants", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSlotDto.prototype, "startAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSlotDto.prototype, "endAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSlotDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSlotDto.prototype, "metadata", void 0);
class GenerateSlotsDto {
    userIds;
    startRange;
    endRange;
    slotDurationMins;
    ruleId;
    timezone;
}
exports.GenerateSlotsDto = GenerateSlotsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateSlotsDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateSlotsDto.prototype, "startRange", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateSlotsDto.prototype, "endRange", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    __metadata("design:type", Number)
], GenerateSlotsDto.prototype, "slotDurationMins", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSlotsDto.prototype, "ruleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSlotsDto.prototype, "timezone", void 0);
class BookSlotDto {
    interviewId;
    candidate;
    candidateId;
    metadata;
}
exports.BookSlotDto = BookSlotDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookSlotDto.prototype, "interviewId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SlotParticipantDto),
    __metadata("design:type", SlotParticipantDto)
], BookSlotDto.prototype, "candidate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BookSlotDto.prototype, "candidateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BookSlotDto.prototype, "metadata", void 0);
class RescheduleSlotDto {
    newStartAt;
    newEndAt;
    reason;
}
exports.RescheduleSlotDto = RescheduleSlotDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RescheduleSlotDto.prototype, "newStartAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RescheduleSlotDto.prototype, "newEndAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RescheduleSlotDto.prototype, "reason", void 0);
class SlotQueryDto {
    status;
    userId;
    start;
    end;
    page;
    perPage;
}
exports.SlotQueryDto = SlotQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SlotQueryDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SlotQueryDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SlotQueryDto.prototype, "end", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SlotQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SlotQueryDto.prototype, "perPage", void 0);
//# sourceMappingURL=slot.dto.js.map