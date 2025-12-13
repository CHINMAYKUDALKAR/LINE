import { Role, UserStatus } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    role?: Role;
    status?: UserStatus;
    teamIds?: string[];
}
