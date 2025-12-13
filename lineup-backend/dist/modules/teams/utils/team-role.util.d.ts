import { Role } from '@prisma/client';
export declare function effectiveRole(userGlobalRole: Role, teamMemberRole?: string | null): Role;
export declare function isTeamLead(teamMemberRole?: string | null): boolean;
export declare function hasTeamPermission(userGlobalRole: Role, teamMemberRole?: string | null, requiredRole?: Role): boolean;
