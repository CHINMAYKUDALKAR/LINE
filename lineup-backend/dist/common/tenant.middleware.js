"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
let TenantMiddleware = class TenantMiddleware {
    use(req, res, next) {
        const headerTenant = req.headers['x-tenant-id'];
        if (typeof headerTenant === 'string' && headerTenant.trim()) {
            req.tenantId = headerTenant.trim();
        }
        if (!req.tenantId && req.headers.authorization) {
            const token = req.headers.authorization.replace('Bearer ', '').trim();
            const decoded = this.decodeToken(token);
            if (decoded && decoded['activeTenantId']) {
                req.tenantId = decoded['activeTenantId'];
            }
        }
        next();
    }
    decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
            return JSON.parse(jsonPayload);
        }
        catch (e) {
            return null;
        }
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)()
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map