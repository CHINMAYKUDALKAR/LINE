import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma Extension for Row Level Security (RLS)
 * 
 * This extension wraps database operations to set the tenant context
 * before each query, enabling PostgreSQL RLS policies.
 */
export function createTenantAwarePrisma(basePrisma: PrismaClient) {
    return basePrisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ operation, model, args, query }) {
                    // Get tenant ID from async context (set by middleware)
                    const tenantId = getTenantFromContext();

                    if (tenantId) {
                        // Set the tenant context for this query
                        await basePrisma.$executeRawUnsafe(
                            `SELECT set_config('app.current_tenant_id', $1, true)`,
                            tenantId
                        );
                    }

                    return query(args);
                },
            },
        },
    });
}

/**
 * Alternative: Prisma middleware approach (simpler, works with existing setup)
 */
export function addRLSMiddleware(prisma: PrismaClient, getTenantId: () => string | null) {
    prisma.$use(async (params, next) => {
        const tenantId = getTenantId();

        if (tenantId) {
            // Set tenant context before each query
            await prisma.$executeRawUnsafe(
                `SELECT set_config('app.current_tenant_id', $1, true)`,
                tenantId
            );
        }

        return next(params);
    });
}

/**
 * Tenant context storage using AsyncLocalStorage
 */
import { AsyncLocalStorage } from 'async_hooks';

interface TenantContext {
    tenantId: string | null;
    isSuperAdmin?: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantFromContext(): string | null {
    const context = tenantStorage.getStore();
    return context?.tenantId || null;
}

export function setTenantContext(tenantId: string, callback: () => Promise<any>) {
    return tenantStorage.run({ tenantId }, callback);
}

export function setSuperAdminContext(callback: () => Promise<any>) {
    return tenantStorage.run({ tenantId: null, isSuperAdmin: true }, callback);
}

/**
 * Express/NestJS middleware to set tenant context from JWT
 */
export function tenantContextMiddleware(req: any, res: any, next: any) {
    const tenantId = req.user?.tenantId || null;

    tenantStorage.run({ tenantId }, () => {
        next();
    });
}

/**
 * NestJS Guard with RLS context
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RLSTenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.user?.tenantId;

        if (tenantId) {
            // Store tenant ID for RLS
            tenantStorage.enterWith({ tenantId });
        }

        return true;
    }
}
