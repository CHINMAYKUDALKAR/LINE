import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RefreshAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
