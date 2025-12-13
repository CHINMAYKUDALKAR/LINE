import { Role } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Role hierarchy levels (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<Role, number> = {
    SUPERADMIN: 5,
    SUPPORT: 4,
    ADMIN: 4,
    MANAGER: 3,
    RECRUITER: 2,
    INTERVIEWER: 1,
};

/**
 * Check if actor role can manage target role
 */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
    const actorLevel = ROLE_HIERARCHY[actorRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return actorLevel > targetLevel;
}

/**
 * Validate role change and throw if not allowed
 */
export function validateRoleChange(actorRole: Role, targetRole: Role): void {
    if (!canManageRole(actorRole, targetRole)) {
        throw new ForbiddenException(
            `Role ${actorRole} cannot manage role ${targetRole}`
        );
    }
}

/**
 * Generate secure 32-byte invitation token
 */
export function generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash invitation token with SHA-256
 */
export function hashInvitationToken(token: string): string {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

/**
 * Get invitation expiry (72 hours from now)
 */
export function getInvitationExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 72);
    return expiry;
}

/**
 * Check if invitation token is expired
 */
export function isInvitationExpired(expiry: Date | null): boolean {
    if (!expiry) return true;
    return new Date() > expiry;
}
