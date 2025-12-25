import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListTeamsDto } from './dto/list-teams.dto';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    createTeam(req: any, dto: CreateTeamDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        leadId: string | null;
    }>;
    listTeams(req: any, dto: ListTeamsDto): Promise<{
        data: {
            memberCount: number;
            _count: undefined;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
            leadId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getTeam(req: any, teamId: string): Promise<{
        memberCount: number;
        _count: undefined;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        leadId: string | null;
    }>;
    updateTeam(req: any, teamId: string, dto: UpdateTeamDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        description: string | null;
        leadId: string | null;
    }>;
    deleteTeam(req: any, teamId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addMember(req: any, teamId: string, dto: AddMemberDto): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        role: string | null;
        userId: string;
        teamId: string;
    }>;
    removeMember(req: any, teamId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getTeamMembers(req: any, teamId: string): Promise<{
        id: string;
        userId: string;
        teamRole: string | null;
        effectiveRole: import("@prisma/client").$Enums.Role;
        user: {
            name: string | null;
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            status: import("@prisma/client").$Enums.UserStatus;
        };
        createdAt: Date;
    }[]>;
}
