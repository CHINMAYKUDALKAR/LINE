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
exports.ConnectedAccountsResponseDto = exports.AuthUrlResponseDto = exports.SyncResultDto = exports.ToggleSyncDto = exports.CalendarAccountDto = exports.CalendarCallbackDto = exports.CalendarConnectDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CalendarConnectDto {
    redirectUri;
}
exports.CalendarConnectDto = CalendarConnectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth redirect URI' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarConnectDto.prototype, "redirectUri", void 0);
class CalendarCallbackDto {
    code;
    redirectUri;
}
exports.CalendarCallbackDto = CalendarCallbackDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth authorization code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarCallbackDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth redirect URI used in authorize' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalendarCallbackDto.prototype, "redirectUri", void 0);
class CalendarAccountDto {
    id;
    provider;
    providerAccountId;
    syncEnabled;
    lastSyncAt;
}
exports.CalendarAccountDto = CalendarAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CalendarAccountDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['google', 'microsoft'] }),
    __metadata("design:type", String)
], CalendarAccountDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CalendarAccountDto.prototype, "providerAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CalendarAccountDto.prototype, "syncEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], CalendarAccountDto.prototype, "lastSyncAt", void 0);
class ToggleSyncDto {
    enabled;
}
exports.ToggleSyncDto = ToggleSyncDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable or disable sync' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleSyncDto.prototype, "enabled", void 0);
class SyncResultDto {
    success;
    eventsProcessed;
}
exports.SyncResultDto = SyncResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SyncResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SyncResultDto.prototype, "eventsProcessed", void 0);
class AuthUrlResponseDto {
    authUrl;
}
exports.AuthUrlResponseDto = AuthUrlResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OAuth authorization URL' }),
    __metadata("design:type", String)
], AuthUrlResponseDto.prototype, "authUrl", void 0);
class ConnectedAccountsResponseDto {
    accounts;
}
exports.ConnectedAccountsResponseDto = ConnectedAccountsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CalendarAccountDto] }),
    __metadata("design:type", Array)
], ConnectedAccountsResponseDto.prototype, "accounts", void 0);
//# sourceMappingURL=calendar-sync.dto.js.map