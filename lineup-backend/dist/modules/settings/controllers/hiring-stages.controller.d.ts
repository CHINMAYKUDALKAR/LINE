import { HiringStagesService } from '../services/hiring-stages.service';
import { CreateHiringStageDto, UpdateHiringStageDto, ReorderHiringStagesDto } from '../dto/hiring-stage.dto';
export declare class HiringStagesController {
    private readonly stagesService;
    constructor(stagesService: HiringStagesService);
    list(req: any, includeInactive?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
    }[]>;
    get(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    create(req: any, dto: CreateHiringStageDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    update(req: any, id: string, dto: UpdateHiringStageDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    reorder(req: any, dto: ReorderHiringStagesDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
    }[]>;
    toggle(req: any, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        key: string;
        order: number;
        color: string | null;
        isActive: boolean;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
