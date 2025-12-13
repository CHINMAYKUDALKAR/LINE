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
exports.TeamAvailabilityResponseDto = exports.UserAvailabilityDto = exports.TeamAvailabilityQueryDto = exports.SuggestionResponseDto = exports.SlotSuggestionDto = exports.SuggestionQueryDto = exports.SlotPreferencesDto = exports.TimeOfDay = exports.MAX_PANEL_INTERVIEWERS = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.MAX_PANEL_INTERVIEWERS = parseInt(process.env.MAX_PANEL_INTERVIEWERS || '5', 10);
var TimeOfDay;
(function (TimeOfDay) {
    TimeOfDay["MORNING"] = "morning";
    TimeOfDay["AFTERNOON"] = "afternoon";
    TimeOfDay["EVENING"] = "evening";
    TimeOfDay["ANY"] = "any";
})(TimeOfDay || (exports.TimeOfDay = TimeOfDay = {}));
class SlotPreferencesDto {
    preferredTimeOfDay;
    preferredDays;
    avoidBackToBack;
    minGapBetweenInterviewsMins;
}
exports.SlotPreferencesDto = SlotPreferencesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeOfDay),
    __metadata("design:type", String)
], SlotPreferencesDto.prototype, "preferredTimeOfDay", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_validator_1.Min)(0, { each: true }),
    (0, class_validator_1.Max)(6, { each: true }),
    __metadata("design:type", Array)
], SlotPreferencesDto.prototype, "preferredDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SlotPreferencesDto.prototype, "avoidBackToBack", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SlotPreferencesDto.prototype, "minGapBetweenInterviewsMins", void 0);
class SuggestionQueryDto {
    userIds;
    candidateId;
    durationMins;
    startRange;
    endRange;
    maxSuggestions;
    preferences;
    ruleId;
}
exports.SuggestionQueryDto = SuggestionQueryDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(exports.MAX_PANEL_INTERVIEWERS),
    __metadata("design:type", Array)
], SuggestionQueryDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestionQueryDto.prototype, "candidateId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], SuggestionQueryDto.prototype, "durationMins", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestionQueryDto.prototype, "startRange", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestionQueryDto.prototype, "endRange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], SuggestionQueryDto.prototype, "maxSuggestions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SlotPreferencesDto),
    __metadata("design:type", SlotPreferencesDto)
], SuggestionQueryDto.prototype, "preferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestionQueryDto.prototype, "ruleId", void 0);
class SlotSuggestionDto {
    start;
    end;
    score;
    reasons;
    userAvailability;
}
exports.SlotSuggestionDto = SlotSuggestionDto;
class SuggestionResponseDto {
    suggestions;
    totalAvailableSlots;
    queryRange;
    processingTimeMs;
}
exports.SuggestionResponseDto = SuggestionResponseDto;
class TeamAvailabilityQueryDto {
    userIds;
    start;
    end;
    slotDurationMins;
}
exports.TeamAvailabilityQueryDto = TeamAvailabilityQueryDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(exports.MAX_PANEL_INTERVIEWERS),
    __metadata("design:type", Array)
], TeamAvailabilityQueryDto.prototype, "userIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamAvailabilityQueryDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TeamAvailabilityQueryDto.prototype, "end", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], TeamAvailabilityQueryDto.prototype, "slotDurationMins", void 0);
class UserAvailabilityDto {
    userId;
    userName;
    intervals;
}
exports.UserAvailabilityDto = UserAvailabilityDto;
class TeamAvailabilityResponseDto {
    userAvailability;
    commonSlots;
    queryRange;
}
exports.TeamAvailabilityResponseDto = TeamAvailabilityResponseDto;
//# sourceMappingURL=suggestion.dto.js.map