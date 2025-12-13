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
exports.canManageRole = canManageRole;
exports.validateRoleChange = validateRoleChange;
exports.generateInvitationToken = generateInvitationToken;
exports.hashInvitationToken = hashInvitationToken;
exports.getInvitationExpiry = getInvitationExpiry;
exports.isInvitationExpired = isInvitationExpired;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const ROLE_HIERARCHY = {
    SUPERADMIN: 5,
    SUPPORT: 4,
    ADMIN: 4,
    MANAGER: 3,
    RECRUITER: 2,
    INTERVIEWER: 1,
};
function canManageRole(actorRole, targetRole) {
    const actorLevel = ROLE_HIERARCHY[actorRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return actorLevel > targetLevel;
}
function validateRoleChange(actorRole, targetRole) {
    if (!canManageRole(actorRole, targetRole)) {
        throw new common_1.ForbiddenException(`Role ${actorRole} cannot manage role ${targetRole}`);
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