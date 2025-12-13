"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectiveRole = effectiveRole;
exports.isTeamLead = isTeamLead;
exports.hasTeamPermission = hasTeamPermission;
function effectiveRole(userGlobalRole, teamMemberRole) {
    if (teamMemberRole === 'TEAM_LEAD') {
        return 'MANAGER';
    }
    return userGlobalRole;
}
function isTeamLead(teamMemberRole) {
    return teamMemberRole === 'TEAM_LEAD';
}
function hasTeamPermission(userGlobalRole, teamMemberRole, requiredRole = 'MANAGER') {
    const effective = effectiveRole(userGlobalRole, teamMemberRole);
    const roleHierarchy = {
        SUPERADMIN: 5,
        SUPPORT: 4,
        ADMIN: 4,
        MANAGER: 3,
        RECRUITER: 2,
        INTERVIEWER: 1,
    };
    return (roleHierarchy[effective] || 0) >= (roleHierarchy[requiredRole] || 0);
}
//# sourceMappingURL=team-role.util.js.map