import { PrismaService } from '../../common/prisma.service';
import { AutomationRule, Prisma } from '@prisma/client';
export declare class AutomationService {
    private prisma;
    constructor(prisma: PrismaService);
    createRule(tenantId: string, userId: string, data: Prisma.AutomationRuleCreateWithoutTenantInput): Promise<AutomationRule>;
    getRules(tenantId: string, limit?: number): Promise<AutomationRule[]>;
    updateRule(tenantId: string, userId: string, id: string, data: Prisma.AutomationRuleUpdateInput): Promise<AutomationRule>;
    deleteRule(tenantId: string, userId: string, id: string): Promise<AutomationRule>;
}
