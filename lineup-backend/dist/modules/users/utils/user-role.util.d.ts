import { Role } from '@prisma/client';
export declare function canManageRole(actorRole: Role, targetRole: Role): boolean;
export declare function validateRoleChange(actorRole: Role, targetRole: Role): void;
export declare function generateInvitationToken(): string;
export declare function hashInvitationToken(token: string): string;
export declare function getInvitationExpiry(): Date;
export declare function isInvitationExpired(expiry: Date | null): boolean;
