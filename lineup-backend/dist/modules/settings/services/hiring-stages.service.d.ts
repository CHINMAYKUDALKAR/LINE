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
    list(tenantId: string, includeInactive?: boolean): Promise<{
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
    get(tenantId: string, id: string): Promise<{
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
    getByKey(tenantId: string, key: string): Promise<{
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
    } | null>;
    validate(tenantId: string, key: string): Promise<boolean>;
    getDefault(tenantId: string): Promise<{
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
    create(tenantId: string, userId: string, dto: CreateHiringStageDto): Promise<{
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
    update(tenantId: string, userId: string, id: string, dto: UpdateHiringStageDto): Promise<{
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
    reorder(tenantId: string, userId: string, stageIds: string[]): Promise<{
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
    toggle(tenantId: string, userId: string, id: string): Promise<{
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
    delete(tenantId: string, userId: string, id: string): Promise<{
        success: boolean;
    }>;
    seedDefaultStages(tenantId: string): Promise<void>;
}
