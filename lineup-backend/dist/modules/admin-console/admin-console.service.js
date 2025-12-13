"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminConsoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const provisioning_util_1 = require("./utils/provisioning.util");
const bcrypt = __importStar(require("bcrypt"));
let AdminConsoleService = class AdminConsoleService {
    prisma;
    queue;
    constructor(prisma) {
        this.prisma = prisma;
        const conn = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null
        });
        this.queue = new bullmq_1.Queue('tenant-provision', { connection: conn });
    }
    async createPlatformUser(dto, currentUserId) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('User already exists');
        const pwd = dto.password || (0, provisioning_util_1.randomPassword)();
        const hashed = await bcrypt.hash(pwd, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                name: dto.name,
                role: dto.role,
                tenantId: null
            }
        });
        await this.prisma.auditLog.create({ data: { userId: currentUserId, tenantId: null, action: 'platform.user.create', metadata: { userId: user.id } } });
        return { id: user.id, password: dto.password ? null : pwd };
    }
    async provisionTenant(dto, currentUserId) {
        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                domain: dto.domain || null,
                settings: { createdBy: currentUserId }
            }
        });
        await this.prisma.auditLog.create({ data: { userId: currentUserId, tenantId: tenant.id, action: 'provision.started', metadata: { dto } } });
        await this.queue.add('provision-tenant', {
            tenantId: tenant.id,
            name: dto.name,
            domain: dto.domain,
            adminEmail: dto.initialAdminEmail
        });
        return { tenantId: tenant.id, status: 'enqueued' };
    }
    async listTenants() {
        return this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async tenantStatus(tenantId) {
        const logs = await this.prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return { tenantId, logs };
    }
    async createTenantAdmin(tenantId, email) {
        const pwd = (0, provisioning_util_1.randomPassword)();
        const hashed = await bcrypt.hash(pwd, 10);
        const user = await this.prisma.user.create({
            data: {
                tenantId,
                email,
                password: hashed,
                name: 'Tenant Admin',
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });
        await this.prisma.auditLog.create({ data: { tenantId, action: 'provision.tenantAdmin.created', metadata: { email } } });
        return { id: user.id, password: pwd };
    }
};
exports.AdminConsoleService = AdminConsoleService;
exports.AdminConsoleService = AdminConsoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminConsoleService);
//# sourceMappingURL=admin-console.service.js.map