export declare enum TeamRole {
    TEAM_LEAD = "TEAM_LEAD",
    TEAM_MEMBER = "TEAM_MEMBER"
}
export declare class AddMemberDto {
    userId: string;
    role?: TeamRole;
}
