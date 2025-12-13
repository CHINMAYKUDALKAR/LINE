"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPAllowlistService = exports.IPAllowlistGuard = exports.SkipIPAllowlist = exports.RequireIPAllowlist = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma.service");
const RequireIPAllowlist = () => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('security:ipAllowlist', true, descriptor?.value || target);
        return descriptor || target;
    };
};
exports.RequireIPAllowlist = RequireIPAllowlist;
const SkipIPAllowlist = () => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata('security:skipIpAllowlist', true, descriptor?.value || target);
        return descriptor || target;
    };
};
exports.SkipIPAllowlist = SkipIPAllowlist;
let IPAllowlistGuard = class IPAllowlistGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const handler = context.getHandler();
        const skipCheck = this.reflector.get('security:skipIpAllowlist', handler);
        if (skipCheck) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const tenantId = request.tenantId;
        if (!tenantId) {
            return true;
        }
        try {
            const policy = await this.prisma.tenantSecurityPolicy.findUnique({
                where: { tenantId },
            });
            if (!policy || !policy.ipAllowlistEnabled) {
                return true;
            }
            const clientIP = this.getClientIP(request);
            const allowedIPs = policy.allowedIPs || [];
            if (this.isIPAllowed(clientIP, allowedIPs)) {
                return true;
            }
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.FORBIDDEN,
                message: 'Access denied. Your IP address is not in the allowlist.',
                code: 'IP_NOT_ALLOWED',
                ip: clientIP,
            }, common_1.HttpStatus.FORBIDDEN);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('IP allowlist check error:', error.message);
            return true;
        }
    }
    getClientIP(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        return request.ip || request.connection?.remoteAddress || 'unknown';
    }
    isIPAllowed(clientIP, allowedIPs) {
        const normalizedClientIP = clientIP.replace(/^::ffff:/, '');
        for (const allowed of allowedIPs) {
            const normalizedAllowed = allowed.replace(/^::ffff:/, '');
            if (allowed.includes('/')) {
                if (this.isIPInCIDR(normalizedClientIP, normalizedAllowed)) {
                    return true;
                }
            }
            else {
                if (normalizedClientIP === normalizedAllowed) {
                    return true;
                }
            }
        }
        return false;
    }
    isIPInCIDR(ip, cidr) {
        const [range, bits] = cidr.split('/');
        const mask = parseInt(bits, 10);
        const ipLong = this.ipToLong(ip);
        const rangeLong = this.ipToLong(range);
        const maskLong = ~((1 << (32 - mask)) - 1);
        return (ipLong & maskLong) === (rangeLong & maskLong);
    }
    ipToLong(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4)
            return 0;
        return parts.reduce((acc, part, i) => acc + parseInt(part, 10) * Math.pow(256, 3 - i), 0);
    }
};
exports.IPAllowlistGuard = IPAllowlistGuard;
exports.IPAllowlistGuard = IPAllowlistGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], IPAllowlistGuard);
let IPAllowlistService = class IPAllowlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPolicy(tenantId) {
        return this.prisma.tenantSecurityPolicy.findUnique({
            where: { tenantId },
        });
    }
    async updateIPAllowlist(tenantId, allowedIPs, enabled) {
        return this.prisma.tenantSecurityPolicy.upsert({
            where: { tenantId },
            update: {
                allowedIPs,
                ipAllowlistEnabled: enabled,
                updatedAt: new Date(),
            },
            create: {
                tenantId,
                allowedIPs,
                ipAllowlistEnabled: enabled,
            },
        });
    }
    async addIP(tenantId, ip) {
        const policy = await this.getPolicy(tenantId);
        const currentIPs = policy?.allowedIPs || [];
        if (!currentIPs.includes(ip)) {
            currentIPs.push(ip);
            return this.updateIPAllowlist(tenantId, currentIPs, policy?.ipAllowlistEnabled ?? false);
        }
        return policy;
    }
    async removeIP(tenantId, ip) {
        const policy = await this.getPolicy(tenantId);
        const currentIPs = policy?.allowedIPs || [];
        const filtered = currentIPs.filter(i => i !== ip);
        return this.updateIPAllowlist(tenantId, filtered, policy?.ipAllowlistEnabled ?? false);
    }
    async toggleIPAllowlist(tenantId, enabled) {
        const policy = await this.getPolicy(tenantId);
        return this.updateIPAllowlist(tenantId, policy?.allowedIPs || [], enabled);
    }
};
exports.IPAllowlistService = IPAllowlistService;
exports.IPAllowlistService = IPAllowlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IPAllowlistService);
//# sourceMappingURL=ip-allowlist.guard.js.map