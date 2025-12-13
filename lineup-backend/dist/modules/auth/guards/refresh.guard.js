"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const token_util_1 = require("../utils/token.util");
let RefreshAuthGuard = class RefreshAuthGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const body = req.body;
        if (!body || !body.refreshToken)
            throw new common_1.UnauthorizedException('Missing refresh token');
        try {
            const payload = (0, token_util_1.verifyRefreshToken)(body.refreshToken);
            req.user = payload;
            return true;
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
};
exports.RefreshAuthGuard = RefreshAuthGuard;
exports.RefreshAuthGuard = RefreshAuthGuard = __decorate([
    (0, common_1.Injectable)()
], RefreshAuthGuard);
//# sourceMappingURL=refresh.guard.js.map