import { Role, UserStatus } from '@prisma/client';
export declare class ListUsersDto {
    q?: string;
    role?: Role;
    status?: UserStatus;
    page?: number;
    perPage?: number;
}
