"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantOwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
let TenantOwnershipGuard = class TenantOwnershipGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const { user, tenantId } = req;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.role === 'SUPERADMIN') {
            return true;
        }
        const activeTenantId = tenantId || user.activeTenantId;
        if (!activeTenantId) {
            throw new common_1.ForbiddenException('No tenant context - cannot access tenant-scoped resources');
        }
        if (user.roles && typeof user.roles === 'object') {
            if (!user.roles[activeTenantId]) {
                throw new common_1.ForbiddenException('You do not have access to this tenant');
            }
        }
        const headerTenantId = req.headers['x-tenant-id'];
        if (headerTenantId && headerTenantId !== activeTenantId) {
            if (user.roles && user.roles[headerTenantId]) {
                req.tenantId = headerTenantId;
            }
            else {
                throw new common_1.ForbiddenException('Cannot access resources of a different tenant');
            }
        }
        req.tenantId = activeTenantId;
        return true;
    }
};
exports.TenantOwnershipGuard = TenantOwnershipGuard;
exports.TenantOwnershipGuard = TenantOwnershipGuard = __decorate([
    (0, common_1.Injectable)()
], TenantOwnershipGuard);
//# sourceMappingURL=tenant-ownership.guard.js.map