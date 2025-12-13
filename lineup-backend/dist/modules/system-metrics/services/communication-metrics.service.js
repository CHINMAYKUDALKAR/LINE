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
exports.CommunicationMetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const client_1 = require("@prisma/client");
let CommunicationMetricsService = class CommunicationMetricsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [messagesToday, successfulMessages, failedMessages, channelCounts, topTemplatesRaw, recentFailures,] = await Promise.all([
            this.prisma.messageLog.count({
                where: { createdAt: { gte: today } },
            }),
            this.prisma.messageLog.count({
                where: {
                    createdAt: { gte: today },
                    status: { in: [client_1.MessageStatus.SENT, client_1.MessageStatus.DELIVERED, client_1.MessageStatus.READ] },
                },
            }),
            this.prisma.messageLog.count({
                where: {
                    createdAt: { gte: today },
                    status: { in: [client_1.MessageStatus.FAILED, client_1.MessageStatus.BOUNCED] },
                },
            }),
            this.prisma.messageLog.groupBy({
                by: ['channel'],
                where: { createdAt: { gte: today } },
                _count: true,
            }),
            this.prisma.messageLog.groupBy({
                by: ['templateId'],
                where: {
                    templateId: { not: null },
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
                _count: true,
                orderBy: { _count: { templateId: 'desc' } },
                take: 5,
            }),
            this.prisma.messageLog.findMany({
                where: {
                    status: { in: [client_1.MessageStatus.FAILED, client_1.MessageStatus.BOUNCED] },
                },
                orderBy: { failedAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    channel: true,
                    recipientEmail: true,
                    recipientPhone: true,
                    status: true,
                    failedAt: true,
                    metadata: true,
                },
            }),
        ]);
        const channelBreakdown = {
            email: 0,
            whatsapp: 0,
            sms: 0,
        };
        for (const count of channelCounts) {
            const key = count.channel.toLowerCase();
            if (key in channelBreakdown) {
                channelBreakdown[key] = count._count;
            }
        }
        const templateIds = topTemplatesRaw
            .map(t => t.templateId)
            .filter((id) => id !== null);
        const templates = await this.prisma.messageTemplate.findMany({
            where: { id: { in: templateIds } },
            select: { id: true, name: true },
        });
        const templateNameMap = new Map(templates.map(t => [t.id, t.name]));
        const topTemplates = topTemplatesRaw.map(t => ({
            templateName: templateNameMap.get(t.templateId) || 'Unknown Template',
            usageCount: t._count,
        }));
        const totalProcessed = successfulMessages + failedMessages;
        const successRate = totalProcessed > 0
            ? (successfulMessages / totalProcessed) * 100
            : 0;
        return {
            messagesToday,
            successRate: Math.round(successRate * 100) / 100,
            failedCount: failedMessages,
            channelBreakdown,
            topTemplates,
            recentFailures: recentFailures.map(f => ({
                id: f.id,
                channel: f.channel.toString(),
                recipientEmail: f.recipientEmail ?? undefined,
                recipientPhone: f.recipientPhone ?? undefined,
                status: f.status.toString(),
                failedAt: f.failedAt ?? undefined,
                metadata: f.metadata,
            })),
        };
    }
};
exports.CommunicationMetricsService = CommunicationMetricsService;
exports.CommunicationMetricsService = CommunicationMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunicationMetricsService);
//# sourceMappingURL=communication-metrics.service.js.map