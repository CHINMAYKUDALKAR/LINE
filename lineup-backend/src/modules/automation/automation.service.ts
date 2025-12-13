import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AutomationRule, Prisma } from '@prisma/client';

@Injectable()
export class AutomationService {
    constructor(private prisma: PrismaService) { }

    async createRule(tenantId: string, data: Prisma.AutomationRuleCreateWithoutTenantInput): Promise<AutomationRule> {
        return this.prisma.automationRule.create({
            data: {
                ...data,
                tenant: { connect: { id: tenantId } },
            },
        });
    }

    async getRules(tenantId: string): Promise<AutomationRule[]> {
        return this.prisma.automationRule.findMany({
            where: { tenantId },
            include: { template: true },
        });
    }

    async updateRule(tenantId: string, id: string, data: Prisma.AutomationRuleUpdateInput): Promise<AutomationRule> {
        return this.prisma.automationRule.update({
            where: { id, tenantId },
            data,
        });
    }

    async deleteRule(tenantId: string, id: string): Promise<AutomationRule> {
        return this.prisma.automationRule.delete({
            where: { id, tenantId },
        });
    }
}
