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
var DomainVerificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainVerificationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const dns = __importStar(require("dns/promises"));
const axios_1 = __importDefault(require("axios"));
let DomainVerificationProcessor = DomainVerificationProcessor_1 = class DomainVerificationProcessor extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(DomainVerificationProcessor_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        const { tenantId, domain, token } = job.data;
        this.logger.log(`Starting domain verification for tenant ${tenantId} domain ${domain}`);
        try {
            const txtRecord = `_lineup-verification.${domain}`;
            try {
                const records = await dns.resolveTxt(txtRecord);
                const flatRecords = records.flat();
                if (flatRecords.includes(token)) {
                    await this.verifySuccess(tenantId);
                    return { success: true, method: 'dns' };
                }
            }
            catch (e) {
                this.logger.debug(`DNS Check failed for ${domain}: ${e.message}`);
            }
            const url = `https://${domain}/.well-known/lineup-verification.txt`;
            try {
                const response = await axios_1.default.get(url, { timeout: 5000 });
                if (response.data && response.data.trim().includes(token)) {
                    await this.verifySuccess(tenantId);
                    return { success: true, method: 'http' };
                }
            }
            catch (e) {
                this.logger.debug(`HTTP Check failed for ${domain}: ${e.message}`);
            }
            throw new Error('Verification failed: Token not found in DNS or HTTP');
        }
        catch (error) {
            this.logger.error(`Verification failed for ${tenantId}: ${error.message}`);
            await this.prisma.auditLog.create({
                data: { tenantId, action: 'DOMAIN_VERIFICATION_FAILED', metadata: { domain, error: error.message } }
            });
            throw error;
        }
    }
    async verifySuccess(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            return;
        const settings = tenant.settings || {};
        if (settings.domainVerification) {
            delete settings.domainVerification;
        }
        await this.prisma.$transaction([
            this.prisma.tenant.update({
                where: { id: tenantId },
                data: { domainVerified: true, settings }
            }),
            this.prisma.auditLog.create({
                data: { tenantId, action: 'DOMAIN_VERIFICATION_SUCCESS', metadata: { domain: tenant.domain } }
            })
        ]);
        this.logger.log(`Domain verified for tenant ${tenantId}`);
    }
};
exports.DomainVerificationProcessor = DomainVerificationProcessor;
exports.DomainVerificationProcessor = DomainVerificationProcessor = DomainVerificationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('domain-verification'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomainVerificationProcessor);
//# sourceMappingURL=domain-verification.processor.js.map