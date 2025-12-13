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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTenantProvisionProcessor = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null
});
const startTenantProvisionProcessor = (prisma, emailService) => {
    const worker = new bullmq_1.Worker('tenant-provision', async (job) => {
        const { tenantId, name, domain, adminEmail } = job.data;
        try {
            await prisma.tenant.update({
                where: { id: tenantId },
                data: { settings: { branding: {}, security: {}, smtp: {}, integrations: {} } }
            });
            if (adminEmail) {
                const pwd = crypto.randomBytes(10).toString('base64').slice(0, 12);
                const hashed = await bcrypt.hash(pwd, 10);
                const user = await prisma.user.create({
                    data: {
                        tenantId,
                        email: adminEmail,
                        password: hashed,
                        name: 'Tenant Admin',
                        role: 'ADMIN',
                        status: 'ACTIVE'
                    }
                });
                await prisma.auditLog.create({ data: { tenantId, userId: user.id, action: 'provision.user.created', metadata: { email: adminEmail } } });
                await emailService.sendOnboardingEmail(tenantId, adminEmail, 'Tenant Admin', name, { userId: user.id, tenantId, purpose: 'onboard' });
                await prisma.auditLog.create({ data: { tenantId, action: 'provision.email.enqueued', metadata: { to: adminEmail } } });
                await emailService.sendOnboardingEmail(tenantId, adminEmail, 'Tenant Admin', name, { userId: user.id, tenantId, purpose: 'onboard' });
            }
            const t = await prisma.tenant.findUnique({ where: { id: tenantId } });
            const currentSettings = t?.settings || {};
            await prisma.tenant.update({
                where: { id: tenantId },
                data: { settings: { ...currentSettings, s3Provisioned: true } }
            });
            await prisma.auditLog.create({ data: { tenantId, action: 'provision.completed', metadata: { tenantId } } });
            return { success: true };
        }
        catch (err) {
            console.error('tenant provision failed', err);
            try {
                await prisma.auditLog.create({ data: { tenantId, action: 'provision.failed', metadata: { error: String(err) } } });
            }
            catch (e) {
                console.error('Failed to log audit failure', e);
            }
            throw err;
        }
    }, { connection });
    worker.on('failed', (job, err) => {
        console.error('Provision job failed', job?.id, err);
    });
    return worker;
};
exports.startTenantProvisionProcessor = startTenantProvisionProcessor;
//# sourceMappingURL=tenant-provision.processor.js.map