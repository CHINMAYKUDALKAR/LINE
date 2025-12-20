"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSIGNABLE_ROLES_BY_TENANT_ADMIN = exports.PROTECTED_ROLES = void 0;
exports.canManageRole = canManageRole;
exports.canAssignRole = canAssignRole;
exports.validateRoleChange = validateRoleChange;
exports.generateInvitationToken = generateInvitationToken;
exports.hashInvitationToken = hashInvitationToken;
exports.getInvitationExpiry = getInvitationExpiry;
exports.isInvitationExpired = isInvitationExpired;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const ROLE_HIERARCHY = {
    SUPERADMIN: 100,
    SUPPORT: 90,
    ADMIN: 80,
    MANAGER: 60,
    RECRUITER: 40,
    INTERVIEWER: 20,
};
exports.PROTECTED_ROLES = ['SUPERADMIN', 'SUPPORT', 'ADMIN'];
exports.ASSIGNABLE_ROLES_BY_TENANT_ADMIN = ['MANAGER', 'RECRUITER', 'INTERVIEWER'];
function canManageRole(actorRole, targetRole) {
    const actorLevel = ROLE_HIERARCHY[actorRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return actorLevel > targetLevel;
}
function canAssignRole(actorRole, targetRole) {
    if (actorRole === 'SUPERADMIN') {
        return true;
    }
    if (exports.PROTECTED_ROLES.includes(targetRole)) {
        return false;
    }
    return canManageRole(actorRole, targetRole);
}
function validateRoleChange(actorRole, targetRole, currentRole) {
    if (exports.PROTECTED_ROLES.includes(targetRole) && actorRole !== 'SUPERADMIN') {
        throw new common_1.ForbiddenException('Admin role can only be assigned by platform administrators');
    }
    if (currentRole && exports.PROTECTED_ROLES.includes(currentRole) && actorRole !== 'SUPERADMIN') {
        throw new common_1.ForbiddenException('Cannot modify users with admin role. Contact platform administrators.');
    }
    if (!canAssignRole(actorRole, targetRole)) {
        throw new common_1.ForbiddenException(`Role ${actorRole} cannot assign role ${targetRole}`);
    }
}
function generateInvitationToken() {
    return crypto.randomBytes(32).toString('hex');
}
function hashInvitationToken(token) {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}
function getInvitationExpiry() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 72);
    return expiry;
}
function isInvitationExpired(expiry) {
    if (!expiry)
        return true;
    return new Date() > expiry;
}
//# sourceMappingURL=user-role.util.js.map