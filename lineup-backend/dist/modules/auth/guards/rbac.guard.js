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
exports.RbacGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
let RbacGuard = class RbacGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const { user, tenantId } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.role === 'SUPERADMIN')
            return true;
        if (user.roles && typeof user.roles === 'object') {
            const activeTenantId = tenantId || user.activeTenantId;
            if (!activeTenantId && requiredRoles.includes('ADMIN')) {
                const hasAdminInAnyTenant = Object.values(user.roles).some((role) => role === 'ADMIN' || role === 'SUPERADMIN');
                if (hasAdminInAnyTenant) {
                    return true;
                }
            }
            if (!activeTenantId) {
                throw new common_1.ForbiddenException('No active tenant context');
            }
            const roleInTenant = user.roles[activeTenantId];
            if (!roleInTenant) {
                throw new common_1.ForbiddenException('No role in active tenant');
            }
            if (this.hasRequiredRole(roleInTenant, requiredRoles)) {
                return true;
            }
            throw new common_1.ForbiddenException('Insufficient permissions for this action');
        }
        if (user.role && requiredRoles.includes(user.role)) {
            return true;
        }
        throw new common_1.ForbiddenException('Insufficient permissions');
    }
    hasRequiredRole(userRole, requiredRoles) {
        const roleHierarchy = {
            'SUPERADMIN': 100,
            'SUPPORT': 90,
            'ADMIN': 80,
            'MANAGER': 60,
            'RECRUITER': 40,
            'INTERVIEWER': 20,
        };
        const userRoleLevel = roleHierarchy[userRole] || 0;
        for (const requiredRole of requiredRoles) {
            const requiredLevel = roleHierarchy[requiredRole] || 0;
            if (userRoleLevel >= requiredLevel) {
                return true;
            }
        }
        return false;
    }
};
exports.RbacGuard = RbacGuard;
exports.RbacGuard = RbacGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RbacGuard);
//# sourceMappingURL=rbac.guard.js.map