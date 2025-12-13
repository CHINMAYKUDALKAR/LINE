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
exports.CreateIdentityProviderDto = exports.SSOProviderType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SSOProviderType;
(function (SSOProviderType) {
    SSOProviderType["SAML"] = "SAML";
    SSOProviderType["GOOGLE"] = "GOOGLE";
    SSOProviderType["MICROSOFT"] = "MICROSOFT";
})(SSOProviderType || (exports.SSOProviderType = SSOProviderType = {}));
class CreateIdentityProviderDto {
    providerType;
    clientId;
    clientSecret;
    redirectUri;
    domainRestriction;
    samlMetadataUrl;
    samlEntityId;
    samlCertificate;
    samlAcsUrl;
    samlSsoUrl;
    samlLogoutUrl;
    autoProvision;
    enabled;
}
exports.CreateIdentityProviderDto = CreateIdentityProviderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SSOProviderType, description: 'SSO provider type' }),
    (0, class_validator_1.IsEnum)(SSOProviderType),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "providerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'OAuth Client ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'OAuth Client Secret' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "clientSecret", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'OAuth Redirect URI' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "redirectUri", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Domain restriction (e.g., acme.com)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "domainRestriction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SAML Metadata URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "samlMetadataUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SAML Entity ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "samlEntityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SAML Certificate (PEM format)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "samlCertificate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SAML Assertion Consumer Service URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "samlAcsUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SAML Single Sign-On URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "samlSsoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SAML Single Logout URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIdentityProviderDto.prototype, "samlLogoutUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Auto-provision users on first login', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateIdentityProviderDto.prototype, "autoProvision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enable this provider', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateIdentityProviderDto.prototype, "enabled", void 0);
//# sourceMappingURL=create-identity-provider.dto.js.map