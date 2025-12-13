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
var AvailabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const working_hours_service_1 = require("./working-hours.service");
const busy_block_service_1 = require("./busy-block.service");
const scheduling_rules_service_1 = require("./scheduling-rules.service");
const interval_math_1 = require("../utils/interval-math");
const cache_util_1 = require("../../../common/cache.util");
const FREE_INTERVALS_TTL = 300;
const BUSY_BLOCKS_TTL = 60;
const CACHE_KEY_PREFIX = 'calendar';
let AvailabilityService = AvailabilityService_1 = class AvailabilityService {
    prisma;
    workingHoursService;
    busyBlockService;
    schedulingRulesService;
    logger = new common_1.Logger(AvailabilityService_1.name);
    constructor(prisma, workingHoursService, busyBlockService, schedulingRulesService) {
        this.prisma = prisma;
        this.workingHoursService = workingHoursService;
        this.busyBlockService = busyBlockService;
        this.schedulingRulesService = schedulingRulesService;
    }
    getFreeIntervalsCacheKey(tenantId, userId, start, end) {
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        return `${CACHE_KEY_PREFIX}:free:${tenantId}:${userId}:${startStr}:${endStr}`;
    }
    getBusyBlocksCacheKey(tenantId, userId, start, end) {
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        return `${CACHE_KEY_PREFIX}:busy:${tenantId}:${userId}:${startStr}:${endStr}`;
    }
    async invalidateUserCache(tenantId, userId) {
        const pattern = `${CACHE_KEY_PREFIX}:*:${tenantId}:${userId}:*`;
        await (0, cache_util_1.invalidateCache)(pattern);
        this.logger.debug(`Invalidated cache for user ${userId}`);
    }
    async invalidateTenantCache(tenantId) {
        const pattern = `${CACHE_KEY_PREFIX}:*:${tenantId}:*`;
        await (0, cache_util_1.invalidateCache)(pattern);
        this.logger.debug(`Invalidated cache for tenant ${tenantId}`);
    }
    async getFreeIntervals(tenantId, userId, start, end) {
        const cacheKey = this.getFreeIntervalsCacheKey(tenantId, userId, start, end);
        const cached = await (0, cache_util_1.getCached)(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit for free intervals: ${userId}`);
            return cached.map(c => ({
                start: new Date(c.start),
                end: new Date(c.end),
            }));
        }
        const intervals = await this.computeFreeIntervals(tenantId, userId, start, end);
        const cacheable = intervals.map(i => ({
            start: i.start.toISOString(),
            end: i.end.toISOString(),
        }));
        await (0, cache_util_1.setCached)(cacheKey, cacheable, FREE_INTERVALS_TTL);
        return intervals;
    }
    async computeFreeIntervals(tenantId, userId, start, end) {
        const workingHours = await this.workingHoursService.getWorkingHours(tenantId, userId);
        if (!workingHours) {
            const defaultPattern = this.workingHoursService.getDefaultPattern();
            return this.expandWeeklyPattern(defaultPattern, start, end, 'UTC');
        }
        const weekly = workingHours.weekly;
        const timezone = workingHours.timezone || 'UTC';
        const workingIntervals = this.expandWeeklyPattern(weekly, start, end, timezone);
        const busyIntervals = await this.getCachedBusyBlocks(tenantId, userId, start, end);
        const freeIntervals = (0, interval_math_1.subtractIntervals)(workingIntervals, busyIntervals);
        return freeIntervals;
    }
    async getCachedBusyBlocks(tenantId, userId, start, end) {
        const cacheKey = this.getBusyBlocksCacheKey(tenantId, userId, start, end);
        const cached = await (0, cache_util_1.getCached)(cacheKey);
        if (cached) {
            return cached.map(c => ({
                start: new Date(c.start),
                end: new Date(c.end),
            }));
        }
        const busyBlocks = await this.busyBlockService.getBusyBlocks(tenantId, {
            userId,
            start: start.toISOString(),
            end: end.toISOString(),
        });
        const intervals = busyBlocks.map((b) => ({
            start: b.startAt,
            end: b.endAt,
        }));
        const cacheable = intervals.map(i => ({
            start: i.start.toISOString(),
            end: i.end.toISOString(),
        }));
        await (0, cache_util_1.setCached)(cacheKey, cacheable, BUSY_BLOCKS_TTL);
        return intervals;
    }
    async getMultiUserAvailability(tenantId, userIds, start, end, durationMins, ruleId) {
        const rule = ruleId
            ? await this.schedulingRulesService.getRule(tenantId, ruleId)
            : await this.schedulingRulesService.getDefaultRule(tenantId);
        const individual = [];
        const intervalLists = [];
        for (const userId of userIds) {
            const intervals = await this.getFreeIntervals(tenantId, userId, start, end);
            individual.push({ userId, intervals });
            intervalLists.push(intervals);
        }
        let combined = (0, interval_math_1.intersectIntervalLists)(intervalLists);
        combined = (0, interval_math_1.applyBuffers)(combined, rule.bufferBeforeMins, rule.bufferAfterMins);
        const slottedIntervals = (0, interval_math_1.sliceIntoSlots)(combined, durationMins);
        const validSlots = (0, interval_math_1.filterByMinNotice)(slottedIntervals, rule.minNoticeMins);
        const slots = validSlots.map((interval) => ({
            start: interval.start,
            end: interval.end,
            durationMins,
        }));
        return { individual, combined: slots };
    }
    expandWeeklyPattern(weekly, start, end, timezone) {
        const intervals = [];
        const patternsByDow = new Map();
        for (const pattern of weekly) {
            if (!patternsByDow.has(pattern.dow)) {
                patternsByDow.set(pattern.dow, []);
            }
            patternsByDow.get(pattern.dow).push(pattern);
        }
        const current = new Date(start);
        current.setHours(0, 0, 0, 0);
        while (current <= end) {
            const dow = current.getDay();
            const patterns = patternsByDow.get(dow);
            if (patterns) {
                for (const pattern of patterns) {
                    const [startHour, startMin] = pattern.start.split(':').map(Number);
                    const [endHour, endMin] = pattern.end.split(':').map(Number);
                    const intervalStart = new Date(current);
                    intervalStart.setHours(startHour, startMin, 0, 0);
                    const intervalEnd = new Date(current);
                    intervalEnd.setHours(endHour, endMin, 0, 0);
                    if (intervalEnd > start && intervalStart < end) {
                        intervals.push({
                            start: new Date(Math.max(intervalStart.getTime(), start.getTime())),
                            end: new Date(Math.min(intervalEnd.getTime(), end.getTime())),
                        });
                    }
                }
            }
            current.setDate(current.getDate() + 1);
        }
        return intervals;
    }
    async isSlotAvailable(tenantId, userIds, start, end) {
        for (const userId of userIds) {
            const freeIntervals = await this.getFreeIntervals(tenantId, userId, start, end);
            const isAvailable = freeIntervals.some((interval) => interval.start.getTime() <= start.getTime() &&
                interval.end.getTime() >= end.getTime());
            if (!isAvailable) {
                return false;
            }
        }
        return true;
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = AvailabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        working_hours_service_1.WorkingHoursService,
        busy_block_service_1.BusyBlockService,
        scheduling_rules_service_1.SchedulingRulesService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map