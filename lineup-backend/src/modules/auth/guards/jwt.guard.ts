import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyAccessToken } from '../utils/token.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;

        if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

        const token = authHeader.replace('Bearer ', '').trim();
        try {
            const payload = verifyAccessToken(token);

            // Set tenantId from token's activeTenantId for backward compatibility
            // Some controllers use req.user.tenantId, others use req.tenantId
            if (payload && typeof payload === 'object' && 'activeTenantId' in payload) {
                (payload as any).tenantId = payload.activeTenantId;
                req.tenantId = payload.activeTenantId;
            }

            req.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }
}

