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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const message_service_1 = require("./message.service");
const client_1 = require("@prisma/client");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    prisma;
    messageService;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(prisma, messageService) {
        this.prisma = prisma;
        this.messageService = messageService;
    }
    async processDueMessages() {
        const now = new Date();
        const dueMessages = await this.prisma.scheduledMessage.findMany({
            where: {
                status: client_1.ScheduleStatus.PENDING,
                scheduledFor: { lte: now },
            },
            take: 100,
        });
        const results = {
            processed: 0,
            failed: 0,
        };
        for (const scheduled of dueMessages) {
            try {
                const payload = scheduled.payload;
                await this.messageService.send(scheduled.tenantId, {
                    channel: scheduled.channel,
                    recipientType: scheduled.recipientType,
                    recipientId: scheduled.recipientId,
                    templateId: scheduled.templateId || undefined,
                    subject: payload.subject,
                    body: payload.body,
                    context: payload.context,
                });
                await this.prisma.scheduledMessage.update({
                    where: { id: scheduled.id },
                    data: { status: client_1.ScheduleStatus.SENT },
                });
                results.processed++;
            }
            catch (error) {
                this.logger.error(`Failed to send scheduled message ${scheduled.id}:`, error);
                await this.prisma.scheduledMessage.update({
                    where: { id: scheduled.id },
                    data: { status: client_1.ScheduleStatus.FAILED },
                });
                results.failed++;
            }
        }
        return results;
    }
    async getUpcoming(tenantId, limit = 20) {
        return this.prisma.scheduledMessage.findMany({
            where: {
                tenantId,
                status: client_1.ScheduleStatus.PENDING,
                scheduledFor: { gt: new Date() },
            },
            orderBy: { scheduledFor: 'asc' },
            take: limit,
        });
    }
    async findOne(tenantId, id) {
        return this.prisma.scheduledMessage.findFirst({
            where: { id, tenantId },
        });
    }
};
exports.SchedulerService = SchedulerService;
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        message_service_1.MessageService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map