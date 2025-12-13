import { PrismaService } from '../../common/prisma.service';
import { AutomationRule, Prisma } from '@prisma/client';
export declare class AutomationService {
    private prisma;
    constructor(prisma: PrismaService);
    createRule(tenantId: string, data: Prisma.AutomationRuleCreateWithoutTenantInput): Promise<AutomationRule>;
    getRules(tenantId: string): Promise<AutomationRule[]>;
    updateRule(tenantId: string, id: string, data: Prisma.AutomationRuleUpdateInput): Promise<AutomationRule>;
    deleteRule(tenantId: string, id: string): Promise<AutomationRule>;
}
