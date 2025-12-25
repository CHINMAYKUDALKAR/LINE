import { PrismaService } from '../../../common/prisma.service';
import { CreateHiringStageDto, UpdateHiringStageDto } from '../dto/hiring-stage.dto';
export declare const DEFAULT_HIRING_STAGES: ({
    name: string;
    key: string;
    order: number;
    color: string;
    isDefault: boolean;
    isTerminal?: undefined;
} | {
    name: string;
    key: string;
    order: number;
    color: string;
    isDefault?: undefined;
    isTerminal?: undefined;
} | {
    name: string;
    key: string;
    order: number;
    color: string;
    isTerminal: boolean;
    isDefault?: undefined;
})[];
export declare class HiringStagesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, includeInactive?: boolean, limit?: number): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }[]>;
    get(tenantId: string, id: string): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    getByKey(tenantId: string, key: string): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    } | null>;
    validate(tenantId: string, key: string): Promise<boolean>;
    getDefault(tenantId: string): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    create(tenantId: string, userId: string, dto: CreateHiringStageDto): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    update(tenantId: string, userId: string, id: string, dto: UpdateHiringStageDto): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    reorder(tenantId: string, userId: string, stageIds: string[]): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }[]>;
    toggle(tenantId: string, userId: string, id: string): Promise<{
        isActive: boolean;
        name: string;
        id: string;
        key: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        order: number;
        color: string | null;
        isDefault: boolean;
        isTerminal: boolean;
    }>;
    delete(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    seedDefaultStages(tenantId: string): Promise<void>;
}
