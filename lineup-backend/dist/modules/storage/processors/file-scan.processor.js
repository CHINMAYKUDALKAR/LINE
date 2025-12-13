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
var FileScanProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScanProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const s3_service_1 = require("../../../common/s3.service");
let FileScanProcessor = FileScanProcessor_1 = class FileScanProcessor extends bullmq_1.WorkerHost {
    prisma;
    s3;
    logger = new common_1.Logger(FileScanProcessor_1.name);
    constructor(prisma, s3) {
        super();
        this.prisma = prisma;
        this.s3 = s3;
    }
    async process(job) {
        const { fileId, tenantId, s3Key } = job.data;
        this.logger.log(`Scanning file ${fileId} at ${s3Key}`);
        try {
            const stream = await this.s3.streamFile(s3Key);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            const scanResult = await this.scanFile(buffer);
            if (scanResult.isInfected) {
                await this.prisma.fileObject.update({
                    where: { id: fileId },
                    data: {
                        scanStatus: 'infected',
                        status: 'quarantined',
                        metadata: {
                            viruses: scanResult.viruses,
                        },
                    },
                });
                await this.prisma.auditLog.create({
                    data: {
                        tenantId,
                        userId: null,
                        action: 'FILE_QUARANTINED',
                        metadata: {
                            fileId,
                            viruses: scanResult.viruses,
                        },
                    },
                });
                this.logger.warn(`File ${fileId} quarantined - infected with: ${scanResult.viruses.join(', ')}`);
            }
            else {
                await this.prisma.fileObject.update({
                    where: { id: fileId },
                    data: {
                        scanStatus: 'clean',
                    },
                });
                this.logger.log(`File ${fileId} scan complete - clean`);
            }
            return { success: true, isClean: !scanResult.isInfected };
        }
        catch (error) {
            this.logger.error(`File scan failed for ${fileId}:`, error.message);
            await this.prisma.fileObject.update({
                where: { id: fileId },
                data: {
                    scanStatus: 'failed',
                },
            });
            throw error;
        }
    }
    async scanFile(buffer) {
        return {
            isInfected: false,
            viruses: [],
        };
    }
};
exports.FileScanProcessor = FileScanProcessor;
exports.FileScanProcessor = FileScanProcessor = FileScanProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('file-scan'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], FileScanProcessor);
//# sourceMappingURL=file-scan.processor.js.map