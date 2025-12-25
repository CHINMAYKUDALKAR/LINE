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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingHoursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const availability_service_1 = require("./availability.service");
let WorkingHoursService = class WorkingHoursService {
    prisma;
    availabilityService;
    constructor(prisma, availabilityService) {
        this.prisma = prisma;
        this.availabilityService = availabilityService;
    }
    async getWorkingHours(tenantId, userId) {
        const workingHours = await this.prisma.workingHours.findFirst({
            where: {
                tenantId,
                userId,
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return workingHours;
    }
    async setWorkingHours(tenantId, currentUserId, currentUserRole, dto) {
        const userId = dto.userId || currentUserId;
        if (userId !== currentUserId && !['ADMIN', 'SUPERADMIN', 'MANAGER'].includes(currentUserRole)) {
            throw new common_1.ForbiddenException('You can only modify your own working hours');
        }
        this.validateWeeklyPattern(dto.weekly);
        const userTenant = await this.prisma.userTenant.findFirst({
            where: { tenantId, userId },
        });
        if (!userTenant) {
            throw new common_1.NotFoundException('User not found in this tenant');
        }
        const existing = await this.prisma.workingHours.findFirst({
            where: { tenantId, userId },
        });
        if (existing) {
            const updated = await this.prisma.workingHours.update({
                where: { id: existing.id },
                data: {
                    weekly: dto.weekly,
                    timezone: dto.timezone,
                    effectiveFrom: dto.effectiveFrom
                        ? new Date(dto.effectiveFrom)
                        : null,
                    effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
                },
            });
            await this.availabilityService.invalidateUserCache(tenantId, userId);
            return updated;
        }
        const created = await this.prisma.workingHours.create({
            data: {
                tenantId,
                userId,
                weekly: dto.weekly,
                timezone: dto.timezone,
                effectiveFrom: dto.effectiveFrom
                    ? new Date(dto.effectiveFrom)
                    : null,
                effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
            },
        });
        await this.availabilityService.invalidateUserCache(tenantId, userId);
        return created;
    }
    getDefaultPattern(timezone = 'UTC') {
        return [
            { dow: 0, start: '08:00', end: '20:00' },
            { dow: 1, start: '08:00', end: '20:00' },
            { dow: 2, start: '08:00', end: '20:00' },
            { dow: 3, start: '08:00', end: '20:00' },
            { dow: 4, start: '08:00', end: '20:00' },
            { dow: 5, start: '08:00', end: '20:00' },
            { dow: 6, start: '08:00', end: '20:00' },
        ];
    }
    validateWeeklyPattern(weekly) {
        for (const pattern of weekly) {
            if (pattern.dow < 0 || pattern.dow > 6) {
                throw new common_1.BadRequestException(`Invalid day of week: ${pattern.dow}`);
            }
            const startParts = pattern.start.split(':').map(Number);
            const endParts = pattern.end.split(':').map(Number);
            if (startParts.length !== 2 ||
                endParts.length !== 2 ||
                isNaN(startParts[0]) ||
                isNaN(startParts[1]) ||
                isNaN(endParts[0]) ||
                isNaN(endParts[1])) {
                throw new common_1.BadRequestException('Invalid time format. Use HH:mm');
            }
            const startMins = startParts[0] * 60 + startParts[1];
            const endMins = endParts[0] * 60 + endParts[1];
            if (endMins <= startMins) {
                throw new common_1.BadRequestException('End time must be after start time');
            }
        }
    }
};
exports.WorkingHoursService = WorkingHoursService;
exports.WorkingHoursService = WorkingHoursService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => availability_service_1.AvailabilityService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        availability_service_1.AvailabilityService])
], WorkingHoursService);
//# sourceMappingURL=working-hours.service.js.map