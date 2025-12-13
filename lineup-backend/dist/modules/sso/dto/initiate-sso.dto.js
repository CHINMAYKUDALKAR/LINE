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
exports.InitiateSSODto = exports.SSOProviderType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SSOProviderType;
(function (SSOProviderType) {
    SSOProviderType["SAML"] = "SAML";
    SSOProviderType["GOOGLE"] = "GOOGLE";
    SSOProviderType["MICROSOFT"] = "MICROSOFT";
})(SSOProviderType || (exports.SSOProviderType = SSOProviderType = {}));
class InitiateSSODto {
    provider;
    returnUrl;
}
exports.InitiateSSODto = InitiateSSODto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SSOProviderType, description: 'Specific provider to use (optional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SSOProviderType),
    __metadata("design:type", String)
], InitiateSSODto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Return URL after SSO completion' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiateSSODto.prototype, "returnUrl", void 0);
//# sourceMappingURL=initiate-sso.dto.js.map