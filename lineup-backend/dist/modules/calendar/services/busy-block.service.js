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
exports.BusyBlockService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const availability_service_1 = require("./availability.service");
let BusyBlockService = class BusyBlockService {
    prisma;
    availabilityService;
    constructor(prisma, availabilityService) {
        this.prisma = prisma;
        this.availabilityService = availabilityService;
    }
    async getBusyBlocks(tenantId, query) {
        const where = { tenantId };
        if (query.userId) {
            where.userId = query.userId;
        }
        if (query.source) {
            where.source = query.source;
        }
        if (query.start || query.end) {
            where.OR = [];
            if (query.start && query.end) {
                where.AND = [
                    { startAt: { lt: new Date(query.end) } },
                    { endAt: { gt: new Date(query.start) } },
                ];
            }
            else if (query.start) {
                where.endAt = { gt: new Date(query.start) };
            }
            else if (query.end) {
                where.startAt = { lt: new Date(query.end) };
            }
        }
        return this.prisma.busyBlock.findMany({
            where,
            orderBy: { startAt: 'asc' },
        });
    }
    async createBusyBlock(tenantId, currentUserId, dto) {
        const userId = dto.userId || currentUserId;
        const startAt = new Date(dto.startAt);
        const endAt = new Date(dto.endAt);
        if (endAt <= startAt) {
            throw new Error('End time must be after start time');
        }
        const block = await this.prisma.busyBlock.create({
            data: {
                tenantId,
                userId,
                startAt,
                endAt,
                reason: dto.reason,
                source: 'manual',
                metadata: dto.metadata,
            },
        });
        await this.availabilityService.invalidateUserCache(tenantId, userId);
        return block;
    }
    async createFromInterview(tenantId, userId, interviewId, startAt, endAt) {
        const block = await this.prisma.busyBlock.create({
            data: {
                tenantId,
                userId,
                startAt,
                endAt,
                source: 'interview',
                sourceId: interviewId,
                reason: 'Interview scheduled',
            },
        });
        await this.availabilityService.invalidateUserCache(tenantId, userId);
        return block;
    }
    async deleteBusyBlock(tenantId, currentUserId, blockId) {
        const block = await this.prisma.busyBlock.findUnique({
            where: { id: blockId },
        });
        if (!block) {
            throw new common_1.NotFoundException('Busy block not found');
        }
        if (block.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (block.source !== 'manual') {
            throw new common_1.ForbiddenException('Cannot delete system-generated busy blocks');
        }
        if (block.userId !== currentUserId) {
        }
        const deleted = await this.prisma.busyBlock.delete({
            where: { id: blockId },
        });
        await this.availabilityService.invalidateUserCache(tenantId, block.userId);
        return deleted;
    }
    async deleteBySourceId(tenantId, sourceId) {
        return this.prisma.busyBlock.deleteMany({
            where: {
                tenantId,
                sourceId,
            },
        });
    }
};
exports.BusyBlockService = BusyBlockService;
exports.BusyBlockService = BusyBlockService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => availability_service_1.AvailabilityService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        availability_service_1.AvailabilityService])
], BusyBlockService);
//# sourceMappingURL=busy-block.service.js.map