import { UsersService } from './users.service';
import { InviteUserDto } from './dto/invite-user.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    inviteUser(req: any, dto: InviteUserDto): Promise<{
        success: boolean;
        userId: string;
        message: string;
    }>;
    acceptInvite(dto: AcceptInviteDto): Promise<{
        success: boolean;
        message: string;
    }>;
    listUsers(req: any, dto: ListUsersDto): Promise<{
        data: {
            name: string | null;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
            lastLogin: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getUser(req: any, id: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        teamIds: string[];
        lastLogin: Date | null;
    }>;
    updateUser(req: any, id: string, dto: UpdateUserDto): Promise<{
        id: string;
        tenantId: string | null;
        email: string;
        password: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        emailVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
        invitationToken: string | null;
        invitationExpiresAt: Date | null;
        teamIds: string[];
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    activateUser(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deactivateUser(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
