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
var EmailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const prisma_service_1 = require("../../../common/prisma.service");
const queues_1 = require("../queues");
const client_1 = require("@prisma/client");
let EmailProcessor = EmailProcessor_1 = class EmailProcessor extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(EmailProcessor_1.name);
    transporter;
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '1025'),
            secure: false,
        });
    }
    async process(job) {
        const { messageLogId, tenantId, recipientEmail, subject, body, context } = job.data;
        this.logger.log(`Processing email job ${job.id} for message ${messageLogId}`);
        if (!recipientEmail) {
            throw new Error('No recipient email provided');
        }
        try {
            const result = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Lineup" <noreply@lineup.local>',
                to: recipientEmail,
                subject: subject || 'Message from Lineup',
                html: body,
                text: body.replace(/<[^>]*>/g, ''),
            });
            this.logger.log(`Email sent successfully: ${result.messageId}`);
            await this.prisma.messageLog.update({
                where: { id: messageLogId },
                data: {
                    status: client_1.MessageStatus.SENT,
                    sentAt: new Date(),
                    externalId: result.messageId,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            await this.prisma.messageLog.update({
                where: { id: messageLogId },
                data: {
                    status: client_1.MessageStatus.FAILED,
                    failedAt: new Date(),
                    retryCount: { increment: 1 },
                    metadata: { error: error.message },
                },
            });
            throw error;
        }
    }
    onFailed(job, error) {
        this.logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
        if (job.attemptsMade >= 3) {
            this.logger.warn(`Job ${job.id} moved to DLQ after max retries`);
        }
    }
    onCompleted(job) {
        this.logger.log(`Job ${job.id} completed successfully`);
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], EmailProcessor.prototype, "onFailed", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], EmailProcessor.prototype, "onCompleted", null);
exports.EmailProcessor = EmailProcessor = EmailProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_1.COMMUNICATION_QUEUES.EMAIL),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map