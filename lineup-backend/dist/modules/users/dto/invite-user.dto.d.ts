import { Role } from '@prisma/client';
export declare class InviteUserDto {
    email: string;
    name: string;
    role: Role;
    teamIds?: string[];
}
