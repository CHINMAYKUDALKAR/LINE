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
exports.ListCandidatesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ListCandidatesDto {
    stage;
    source;
    q;
    page;
    perPage;
    sort;
    recruiterId;
    dateFrom;
    dateTo;
}
exports.ListCandidatesDto = ListCandidatesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by hiring stage', example: 'Interview' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by source', example: 'LinkedIn' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search query (name, email, phone)', example: 'john' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', example: '20' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "perPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sort order (field:direction)', example: 'createdAt:desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by recruiter ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "recruiterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date (from)', example: '2023-01-01' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "dateFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by date (to)', example: '2023-01-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCandidatesDto.prototype, "dateTo", void 0);
//# sourceMappingURL=list-candidates.dto.js.map