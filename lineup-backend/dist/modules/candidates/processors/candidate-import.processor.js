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
var CandidateImportProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateImportProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const email_service_1 = require("../../email/email.service");
const axios_1 = __importDefault(require("axios"));
const csv = __importStar(require("csv-parse"));
let CandidateImportProcessor = CandidateImportProcessor_1 = class CandidateImportProcessor extends bullmq_1.WorkerHost {
    prisma;
    emailService;
    logger = new common_1.Logger(CandidateImportProcessor_1.name);
    constructor(prisma, emailService) {
        super();
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async process(job) {
        const { tenantId, userId, url, mode } = job.data;
        this.logger.log(`Starting candidate import for tenant ${tenantId}`);
        let successCount = 0;
        let failCount = 0;
        const errors = [];
        try {
            const response = await axios_1.default.get(url, { responseType: 'stream' });
            const parser = response.data.pipe(csv.parse({ columns: true, trim: true }));
            for await (const row of parser) {
                try {
                    const email = row.email;
                    const name = row.name;
                    if (!email || !name) {
                        failCount++;
                        errors.push(`Row missing name or email: ${JSON.stringify(row)}`);
                        continue;
                    }
                    if (mode === 'create-only') {
                        const existing = await this.prisma.candidate.findFirst({
                            where: { tenantId, email }
                        });
                        if (existing) {
                            failCount++;
                            continue;
                        }
                    }
                    await this.prisma.candidate.upsert({
                        where: {
                            id: 'non-existent-id'
                        },
                        update: {
                            name,
                            phone: row.phone,
                            roleTitle: row.roleTitle,
                            stage: row.stage || 'Applied',
                            source: row.source || 'Import',
                            tags: row.tags ? row.tags.split(',') : [],
                        },
                        create: {
                            tenantId,
                            name,
                            email,
                            phone: row.phone,
                            roleTitle: row.roleTitle,
                            stage: row.stage || 'Applied',
                            source: row.source || 'Import',
                            tags: row.tags ? row.tags.split(',') : [],
                            createdById: userId
                        }
                    });
                    const existing = await this.prisma.candidate.findFirst({ where: { tenantId, email } });
                    if (existing) {
                        if (mode !== 'create-only') {
                            await this.prisma.candidate.update({
                                where: { id: existing.id },
                                data: {
                                    name,
                                    phone: row.phone,
                                    roleTitle: row.roleTitle,
                                    stage: row.stage || existing.stage,
                                    tags: row.tags ? row.tags.split(',') : undefined
                                }
                            });
                        }
                    }
                    else {
                        await this.prisma.candidate.create({
                            data: {
                                tenantId,
                                name,
                                email,
                                phone: row.phone,
                                roleTitle: row.roleTitle,
                                stage: row.stage || 'Applied',
                                source: row.source || 'Import',
                                tags: row.tags ? row.tags.split(',') : [],
                                createdById: userId
                            }
                        });
                    }
                    successCount++;
                }
                catch (err) {
                    failCount++;
                    errors.push(`Error processing row ${JSON.stringify(row)}: ${err.message}`);
                }
            }
            await this.prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'CANDIDATE_IMPORT',
                    metadata: { success: successCount, failed: failCount, url }
                }
            });
        }
        catch (error) {
            this.logger.error(`Import failed: ${error.message}`);
            throw error;
        }
    }
};
exports.CandidateImportProcessor = CandidateImportProcessor;
exports.CandidateImportProcessor = CandidateImportProcessor = CandidateImportProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('candidate-import'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], CandidateImportProcessor);
//# sourceMappingURL=candidate-import.processor.js.map