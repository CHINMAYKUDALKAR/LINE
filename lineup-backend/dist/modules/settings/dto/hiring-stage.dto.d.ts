export declare class CreateHiringStageDto {
    name: string;
    key: string;
    color?: string;
    isDefault?: boolean;
}
export declare class UpdateHiringStageDto {
    name?: string;
    color?: string;
    isActive?: boolean;
    isDefault?: boolean;
}
export declare class ReorderHiringStagesDto {
    stageIds: string[];
}
export interface HiringStageResponse {
    id: string;
    tenantId: string;
    name: string;
    key: string;
    order: number;
    color: string | null;
    isActive: boolean;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
