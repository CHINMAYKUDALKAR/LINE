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
var TextExtractProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const s3_service_1 = require("../../../common/s3.service");
const text_extract_util_1 = require("../utils/text-extract.util");
const ocr_util_1 = require("../utils/ocr.util");
let TextExtractProcessor = TextExtractProcessor_1 = class TextExtractProcessor extends bullmq_1.WorkerHost {
    prisma;
    s3;
    logger = new common_1.Logger(TextExtractProcessor_1.name);
    constructor(prisma, s3) {
        super();
        this.prisma = prisma;
        this.s3 = s3;
    }
    async process(job) {
        const { fileId, tenantId, s3Key, mimeType } = job.data;
        this.logger.log(`Extracting text from file ${fileId}`);
        try {
            const stream = await this.s3.streamFile(s3Key);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            let extractedText = '';
            if ((0, ocr_util_1.isImageMimeType)(mimeType)) {
                extractedText = await (0, ocr_util_1.runOCR)(buffer);
            }
            else {
                extractedText = await (0, text_extract_util_1.extractText)(buffer, mimeType);
            }
            const file = await this.prisma.fileObject.findUnique({
                where: { id: fileId },
            });
            if (!file) {
                this.logger.error(`File ${fileId} not found`);
                throw new Error('File not found');
            }
            await this.prisma.fileObject.update({
                where: { id: fileId },
                data: {
                    metadata: {
                        ...(file.metadata || {}),
                        extractedText,
                        extractedAt: new Date().toISOString(),
                    },
                },
            });
            if (file.linkedType === 'candidate' && file.linkedId) {
            }
            this.logger.log(`Text extraction complete for file ${fileId} - ${extractedText.length} characters`);
            return { success: true, textLength: extractedText.length };
        }
        catch (error) {
            this.logger.error(`Text extraction failed for ${fileId}:`, error.message);
            throw error;
        }
    }
};
exports.TextExtractProcessor = TextExtractProcessor;
exports.TextExtractProcessor = TextExtractProcessor = TextExtractProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('file-text-extract'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], TextExtractProcessor);
//# sourceMappingURL=text-extract.processor.js.map