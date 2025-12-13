import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ListTeamsDto } from './dto/list-teams.dto';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    createTeam(req: any, dto: CreateTeamDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        leadId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listTeams(req: any, dto: ListTeamsDto): Promise<{
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
    getTeam(req: any, teamId: string): Promise<{
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
    updateTeam(req: any, teamId: string, dto: UpdateTeamDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        leadId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteTeam(req: any, teamId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addMember(req: any, teamId: string, dto: AddMemberDto): Promise<{
        id: string;
        tenantId: string;
        teamId: string;
        userId: string;
        role: string | null;
        createdAt: Date;
    }>;
    removeMember(req: any, teamId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getTeamMembers(req: any, teamId: string): Promise<{
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
}
