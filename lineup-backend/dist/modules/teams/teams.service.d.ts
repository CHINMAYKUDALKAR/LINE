import { PrismaService } from '../../common/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListTeamsDto } from './dto/list-teams.dto';
export declare class TeamsService {
    private prisma;
    constructor(prisma: PrismaService);
    createTeam(tenantId: string, userId: string, dto: CreateTeamDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        leadId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listTeams(tenantId: string, dto: ListTeamsDto): Promise<{
        data: {
            memberCount: number;
            _count: undefined;
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            leadId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getTeam(tenantId: string, teamId: string): Promise<{
        memberCount: number;
        _count: undefined;
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        leadId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTeam(tenantId: string, userId: string, teamId: string, dto: UpdateTeamDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        leadId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteTeam(tenantId: string, userId: string, teamId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addMember(tenantId: string, userId: string, teamId: string, dto: AddMemberDto): Promise<{
        id: string;
        tenantId: string;
        teamId: string;
        userId: string;
        role: string | null;
        createdAt: Date;
    }>;
    removeMember(tenantId: string, userId: string, teamId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getTeamMembers(tenantId: string, teamId: string): Promise<{
        id: string;
        userId: string;
        teamRole: string | null;
        effectiveRole: import(".prisma/client").$Enums.Role;
        user: {
            name: string | null;
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
        createdAt: Date;
    }[]>;
    getAvailableInterviewers(teamId: string, dateRange?: any): Promise<{
        name: string | null;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
    }[]>;
}
