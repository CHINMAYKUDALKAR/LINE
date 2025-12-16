import { Role, UserStatus } from '@prisma/client';
export declare class ListUsersDto {
    q?: string;
    role?: Role;
    roles?: string;
    status?: UserStatus;
    page?: number;
    perPage?: number;
}
