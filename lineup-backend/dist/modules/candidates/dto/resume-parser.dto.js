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
exports.CreateCandidateFromResumeDto = exports.BulkParseResponseDto = exports.BulkParseSummaryDto = exports.ParsedResumeResponseDto = exports.ExtractedFieldsDto = exports.FieldConfidenceDto = exports.BulkParseResumesDto = exports.ParseResumeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ParseResumeDto {
    fileId;
}
exports.ParseResumeDto = ParseResumeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the uploaded file (from storage service)',
        example: 'clxyz123abc'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParseResumeDto.prototype, "fileId", void 0);
class BulkParseResumesDto {
    fileIds;
}
exports.BulkParseResumesDto = BulkParseResumesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of file IDs to parse',
        example: ['clxyz123abc', 'clxyz456def']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkParseResumesDto.prototype, "fileIds", void 0);
class FieldConfidenceDto {
    name;
    email;
    phone;
}
exports.FieldConfidenceDto = FieldConfidenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether name was confidently extracted' }),
    __metadata("design:type", Boolean)
], FieldConfidenceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether email was confidently extracted' }),
    __metadata("design:type", Boolean)
], FieldConfidenceDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether phone was confidently extracted' }),
    __metadata("design:type", Boolean)
], FieldConfidenceDto.prototype, "phone", void 0);
class ExtractedFieldsDto {
    name;
    email;
    phone;
    skills;
    experience;
}
exports.ExtractedFieldsDto = ExtractedFieldsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Extracted candidate name' }),
    __metadata("design:type", String)
], ExtractedFieldsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Extracted email address' }),
    __metadata("design:type", String)
], ExtractedFieldsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Extracted phone number' }),
    __metadata("design:type", String)
], ExtractedFieldsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Extracted skills (keyword-based)', type: [String] }),
    __metadata("design:type", Array)
], ExtractedFieldsDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Raw experience text (unstructured)' }),
    __metadata("design:type", String)
], ExtractedFieldsDto.prototype, "experience", void 0);
class ParsedResumeResponseDto {
    status;
    fields;
    confidence;
    rawText;
    fileId;
    filename;
}
exports.ParsedResumeResponseDto = ParsedResumeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parse status',
        enum: ['PARSED', 'PARTIALLY_PARSED', 'UNPARSABLE']
    }),
    __metadata("design:type", String)
], ParsedResumeResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Extracted fields', type: ExtractedFieldsDto }),
    __metadata("design:type", ExtractedFieldsDto)
], ParsedResumeResponseDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Confidence flags for each field', type: FieldConfidenceDto }),
    __metadata("design:type", FieldConfidenceDto)
], ParsedResumeResponseDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Raw extracted text' }),
    __metadata("design:type", String)
], ParsedResumeResponseDto.prototype, "rawText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File ID that was parsed' }),
    __metadata("design:type", String)
], ParsedResumeResponseDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Original filename' }),
    __metadata("design:type", String)
], ParsedResumeResponseDto.prototype, "filename", void 0);
class BulkParseSummaryDto {
    total;
    parsed;
    partiallyParsed;
    unparsable;
}
exports.BulkParseSummaryDto = BulkParseSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total files processed' }),
    __metadata("design:type", Number)
], BulkParseSummaryDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Successfully parsed' }),
    __metadata("design:type", Number)
], BulkParseSummaryDto.prototype, "parsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Partially parsed' }),
    __metadata("design:type", Number)
], BulkParseSummaryDto.prototype, "partiallyParsed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Failed to parse' }),
    __metadata("design:type", Number)
], BulkParseSummaryDto.prototype, "unparsable", void 0);
class BulkParseResponseDto {
    results;
    summary;
}
exports.BulkParseResponseDto = BulkParseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parse results for each file', type: [ParsedResumeResponseDto] }),
    __metadata("design:type", Array)
], BulkParseResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Summary of results', type: BulkParseSummaryDto }),
    __metadata("design:type", BulkParseSummaryDto)
], BulkParseResponseDto.prototype, "summary", void 0);
class CreateCandidateFromResumeDto {
    fileId;
    name;
    email;
    phone;
    skills;
    roleTitle;
    stage;
}
exports.CreateCandidateFromResumeDto = CreateCandidateFromResumeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File ID of the parsed resume',
        example: 'clxyz123abc'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateFromResumeDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Candidate name (reviewed/edited by recruiter)',
        example: 'John Doe'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateCandidateFromResumeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email address',
        example: 'john.doe@example.com'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateFromResumeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Phone number',
        example: '+1 555-123-4567'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateFromResumeDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Skills extracted from resume',
        example: ['JavaScript', 'React', 'Node.js']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCandidateFromResumeDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Job title/role',
        example: 'Software Engineer'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateFromResumeDto.prototype, "roleTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Initial stage key',
        example: 'APPLIED'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCandidateFromResumeDto.prototype, "stage", void 0);
//# sourceMappingURL=resume-parser.dto.js.map