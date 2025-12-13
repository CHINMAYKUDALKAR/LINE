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
exports.SchedulingMetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let SchedulingMetricsService = class SchedulingMetricsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fiveMinutesMs = 5 * 60 * 1000;
        const [interviewsToday, cancelledToday, rescheduledToday, avgTimeToFirstInterview,] = await Promise.all([
            this.prisma.interview.count({
                where: {
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            }),
            this.prisma.interview.count({
                where: {
                    status: 'CANCELLED',
                    updatedAt: { gte: today },
                },
            }),
            this.prisma.$queryRaw `
                SELECT COUNT(*) as count
                FROM "Interview"
                WHERE "updatedAt" >= ${today}
                AND "updatedAt" > "createdAt" + interval '5 minutes'
                AND "status" != 'CANCELLED'
            `.then(result => Number(result[0]?.count || 0)),
            this.prisma.$queryRaw `
                SELECT AVG(EXTRACT(EPOCH FROM (i."createdAt" - c."createdAt")) / 3600) as avg_hours
                FROM "Interview" i
                JOIN "Candidate" c ON i."candidateId" = c.id
                WHERE i."createdAt" >= NOW() - interval '30 days'
                AND i."createdAt" = (
                    SELECT MIN(i2."createdAt")
                    FROM "Interview" i2
                    WHERE i2."candidateId" = i."candidateId"
                )
            `.then(result => Math.round((result[0]?.avg_hours || 0) * 100) / 100),
        ]);
        return {
            interviewsToday,
            rescheduledToday,
            cancelledToday,
            availabilityEngineAvgMs: 45,
            avgTimeToFirstInterviewHours: avgTimeToFirstInterview,
        };
    }
};
exports.SchedulingMetricsService = SchedulingMetricsService;
exports.SchedulingMetricsService = SchedulingMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulingMetricsService);
//# sourceMappingURL=scheduling-metrics.service.js.map