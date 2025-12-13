"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformRbacGuard = void 0;
const common_1 = require("@nestjs/common");
let PlatformRbacGuard = class PlatformRbacGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (!user)
            throw new common_1.ForbiddenException('Not authenticated');
        const allowed = ['SUPERADMIN', 'SUPPORT'];
        if (!allowed.includes(user.role))
            throw new common_1.ForbiddenException('Platform access required');
        return true;
    }
};
exports.PlatformRbacGuard = PlatformRbacGuard;
exports.PlatformRbacGuard = PlatformRbacGuard = __decorate([
    (0, common_1.Injectable)()
], PlatformRbacGuard);
//# sourceMappingURL=platform-rbac.guard.js.map