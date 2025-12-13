import { Role } from '@prisma/client';
export declare class CreateInvitationDto {
    email: string;
    role?: Role;
    name?: string;
}
