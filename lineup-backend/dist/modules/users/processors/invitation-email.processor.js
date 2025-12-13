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
var InvitationEmailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationEmailProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const email_service_1 = require("../../email/email.service");
let InvitationEmailProcessor = InvitationEmailProcessor_1 = class InvitationEmailProcessor extends bullmq_1.WorkerHost {
    prisma;
    emailService;
    logger = new common_1.Logger(InvitationEmailProcessor_1.name);
    constructor(prisma, emailService) {
        super();
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async process(job) {
        const { tenantId, userId, email, name, invitationLink } = job.data;
        this.logger.log(`Processing invitation email for ${email}`);
        try {
            await this.emailService.sendMail(tenantId, {
                to: email,
                template: 'invite',
                context: {
                    name,
                    link: invitationLink,
                }
            });
            this.logger.log(`Invitation email sent to ${email}`);
            await this.prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'email.invitation.sent',
                    metadata: {
                        email,
                        name,
                        invitationLink: invitationLink.replace(/token=.*/, 'token=***'),
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to send invitation email to ${email}`, error.stack);
            await this.prisma.auditLog.create({
                data: {
                    tenantId,
                    userId,
                    action: 'email.invitation.failed',
                    metadata: {
                        email,
                        error: error.message
                    },
                },
            });
            throw error;
        }
    }
};
exports.InvitationEmailProcessor = InvitationEmailProcessor;
exports.InvitationEmailProcessor = InvitationEmailProcessor = InvitationEmailProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('user-invitations'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InvitationEmailProcessor);
//# sourceMappingURL=invitation-email.processor.js.map