import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class TenantOwnershipGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
