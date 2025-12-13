"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teams_service_1 = require("./teams.service");
const create_team_dto_1 = require("./dto/create-team.dto");
const update_team_dto_1 = require("./dto/update-team.dto");
const add_member_dto_1 = require("./dto/add-member.dto");
const list_teams_dto_1 = require("./dto/list-teams.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const rbac_guard_1 = require("../auth/guards/rbac.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let TeamsController = class TeamsController {
    teamsService;
    constructor(teamsService) {
        this.teamsService = teamsService;
    }
    createTeam(req, dto) {
        return this.teamsService.createTeam(req.user.tenantId, req.user.sub, dto);
    }
    listTeams(req, dto) {
        return this.teamsService.listTeams(req.user.tenantId, dto);
    }
    getTeam(req, teamId) {
        return this.teamsService.getTeam(req.user.tenantId, teamId);
    }
    updateTeam(req, teamId, dto) {
        return this.teamsService.updateTeam(req.user.tenantId, req.user.sub, teamId, dto);
    }
    deleteTeam(req, teamId) {
        return this.teamsService.deleteTeam(req.user.tenantId, req.user.sub, teamId);
    }
    addMember(req, teamId, dto) {
        return this.teamsService.addMember(req.user.tenantId, req.user.sub, teamId, dto);
    }
    removeMember(req, teamId, memberId) {
        return this.teamsService.removeMember(req.user.tenantId, req.user.sub, teamId, memberId);
    }
    getTeamMembers(req, teamId) {
        return this.teamsService.getTeamMembers(req.user.tenantId, teamId);
    }
};
exports.TeamsController = TeamsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new team' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Team created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Team name already exists' }),
    (0, swagger_1.ApiBody)({ type: create_team_dto_1.CreateTeamDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_team_dto_1.CreateTeamDto]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "createTeam", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'List all teams with pagination and search' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of teams' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, list_teams_dto_1.ListTeamsDto]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "listTeams", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get team by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Team ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update team details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Team ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    (0, swagger_1.ApiBody)({ type: update_team_dto_1.UpdateTeamDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_team_dto_1.UpdateTeamDto]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "updateTeam", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete team' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Team ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Team deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Team not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "deleteTeam", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Add member to team' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Team ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Member added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'User already a member or not found' }),
    (0, swagger_1.ApiBody)({ type: add_member_dto_1.AddMemberDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_member_dto_1.AddMemberDto]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from team' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Team ID' }),
    (0, swagger_1.ApiParam)({ name: 'memberId', description: 'Member ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Member removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Member not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Get team members with effective roles' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Team ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of team members' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TeamsController.prototype, "getTeamMembers", null);
exports.TeamsController = TeamsController = __decorate([
    (0, swagger_1.ApiTags)('teams'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('api/v1/teams'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [teams_service_1.TeamsService])
], TeamsController);
//# sourceMappingURL=teams.controller.js.map