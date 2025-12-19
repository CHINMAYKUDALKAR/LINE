import { HiringStagesService } from '../services/hiring-stages.service';
import { CreateHiringStageDto, UpdateHiringStageDto, ReorderHiringStagesDto } from '../dto/hiring-stage.dto';
export declare class HiringStagesController {
    private readonly stagesService;
    constructor(stagesService: HiringStagesService);
    list(req: any, includeInactive?: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    get(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: any, dto: CreateHiringStageDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(req: any, id: string, dto: UpdateHiringStageDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    reorder(req: any, dto: ReorderHiringStagesDto): Promise<{
        id: string;
        tenantId: string;
        name: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    toggle(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
