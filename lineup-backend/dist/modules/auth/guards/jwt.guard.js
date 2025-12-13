"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const token_util_1 = require("../utils/token.util");
let JwtAuthGuard = class JwtAuthGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new common_1.UnauthorizedException('Missing Authorization header');
        const token = authHeader.replace('Bearer ', '').trim();
        try {
            const payload = (0, token_util_1.verifyAccessToken)(token);
            if (payload && typeof payload === 'object' && 'activeTenantId' in payload) {
                payload.tenantId = payload.activeTenantId;
                req.tenantId = payload.activeTenantId;
            }
            req.user = payload;
            return true;
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid or expired access token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt.guard.js.map