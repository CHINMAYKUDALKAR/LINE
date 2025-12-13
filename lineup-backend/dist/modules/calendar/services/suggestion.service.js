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
var SuggestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const availability_service_1 = require("./availability.service");
const busy_block_service_1 = require("./busy-block.service");
const scheduling_rules_service_1 = require("./scheduling-rules.service");
const suggestion_dto_1 = require("../dto/suggestion.dto");
let SuggestionService = SuggestionService_1 = class SuggestionService {
    prisma;
    availabilityService;
    busyBlockService;
    schedulingRulesService;
    logger = new common_1.Logger(SuggestionService_1.name);
    constructor(prisma, availabilityService, busyBlockService, schedulingRulesService) {
        this.prisma = prisma;
        this.availabilityService = availabilityService;
        this.busyBlockService = busyBlockService;
        this.schedulingRulesService = schedulingRulesService;
    }
    async getSuggestions(tenantId, dto) {
        const startTime = Date.now();
        if (dto.userIds.length > suggestion_dto_1.MAX_PANEL_INTERVIEWERS) {
            throw new common_1.BadRequestException(`Maximum ${suggestion_dto_1.MAX_PANEL_INTERVIEWERS} interviewers allowed per panel`);
        }
        const startRange = new Date(dto.startRange);
        const endRange = new Date(dto.endRange);
        const maxSuggestions = dto.maxSuggestions || 10;
        const multiUserResult = await this.availabilityService.getMultiUserAvailability(tenantId, dto.userIds, startRange, endRange, dto.durationMins, dto.ruleId);
        if (multiUserResult.combined.length === 0) {
            return {
                suggestions: [],
                totalAvailableSlots: 0,
                queryRange: { start: dto.startRange, end: dto.endRange },
                processingTimeMs: Date.now() - startTime,
            };
        }
        const availableSlots = multiUserResult.combined.map(s => ({
            start: s.start,
            end: s.end,
        }));
        const loads = await this.getInterviewerLoads(tenantId, dto.userIds, startRange, endRange);
        let candidateInterviews = [];
        if (dto.candidateId) {
            candidateInterviews = await this.getCandidateInterviewDates(tenantId, dto.candidateId, startRange, endRange);
        }
        const rankedSlots = this.rankSlots(availableSlots, dto.userIds, loads, candidateInterviews, dto.preferences);
        rankedSlots.sort((a, b) => b.score - a.score);
        const topSlots = rankedSlots.slice(0, maxSuggestions);
        const suggestions = topSlots.map(ranked => ({
            start: ranked.slot.start.toISOString(),
            end: ranked.slot.end.toISOString(),
            score: Math.round(ranked.score),
            reasons: ranked.reasons,
            userAvailability: this.buildUserAvailabilityMap(ranked.slot, dto.userIds, multiUserResult.individual),
        }));
        return {
            suggestions,
            totalAvailableSlots: availableSlots.length,
            queryRange: { start: dto.startRange, end: dto.endRange },
            processingTimeMs: Date.now() - startTime,
        };
    }
    async getTeamAvailability(tenantId, dto) {
        if (dto.userIds.length > suggestion_dto_1.MAX_PANEL_INTERVIEWERS) {
            throw new common_1.BadRequestException(`Maximum ${suggestion_dto_1.MAX_PANEL_INTERVIEWERS} interviewers allowed`);
        }
        const start = new Date(dto.start);
        const end = new Date(dto.end);
        const users = await this.prisma.user.findMany({
            where: { id: { in: dto.userIds } },
            select: { id: true, name: true },
        });
        const userMap = new Map(users.map(u => [u.id, u.name]));
        const userAvailability = [];
        for (const userId of dto.userIds) {
            const intervals = await this.availabilityService.getFreeIntervals(tenantId, userId, start, end);
            userAvailability.push({
                userId,
                userName: userMap.get(userId) || undefined,
                intervals: intervals.map(i => ({
                    start: i.start.toISOString(),
                    end: i.end.toISOString(),
                })),
            });
        }
        const multiUserResult = await this.availabilityService.getMultiUserAvailability(tenantId, dto.userIds, start, end, dto.slotDurationMins || 60);
        return {
            userAvailability,
            commonSlots: multiUserResult.combined.map(s => ({
                start: s.start.toISOString(),
                end: s.end.toISOString(),
            })),
            queryRange: { start: dto.start, end: dto.end },
        };
    }
    rankSlots(slots, userIds, loads, candidateInterviews, preferences) {
        return slots.map(slot => {
            let score = 50;
            const reasons = [];
            const timeScore = this.scoreTimeOfDay(slot, preferences?.preferredTimeOfDay);
            score += timeScore.score;
            if (timeScore.reason)
                reasons.push(timeScore.reason);
            const dayScore = this.scoreDayOfWeek(slot, preferences?.preferredDays);
            score += dayScore.score;
            if (dayScore.reason)
                reasons.push(dayScore.reason);
            const loadScore = this.scoreLoadBalance(slot, userIds, loads);
            score += loadScore.score;
            if (loadScore.reason)
                reasons.push(loadScore.reason);
            if (preferences?.avoidBackToBack && candidateInterviews.length > 0) {
                const gapScore = this.scoreGapFromOtherInterviews(slot, candidateInterviews, preferences.minGapBetweenInterviewsMins || 60);
                score += gapScore.score;
                if (gapScore.reason)
                    reasons.push(gapScore.reason);
            }
            const soonerScore = this.scoreSooner(slot);
            score += soonerScore.score;
            if (soonerScore.reason)
                reasons.push(soonerScore.reason);
            score = Math.max(0, Math.min(100, score));
            return { slot, score, reasons };
        });
    }
    scoreTimeOfDay(slot, preference) {
        if (!preference || preference === suggestion_dto_1.TimeOfDay.ANY) {
            return { score: 0 };
        }
        const hour = slot.start.getHours();
        const isMorning = hour >= 8 && hour < 12;
        const isAfternoon = hour >= 12 && hour < 17;
        const isEvening = hour >= 17 && hour < 21;
        if (preference === suggestion_dto_1.TimeOfDay.MORNING && isMorning) {
            return { score: 20, reason: 'Matches morning preference' };
        }
        if (preference === suggestion_dto_1.TimeOfDay.AFTERNOON && isAfternoon) {
            return { score: 20, reason: 'Matches afternoon preference' };
        }
        if (preference === suggestion_dto_1.TimeOfDay.EVENING && isEvening) {
            return { score: 20, reason: 'Matches evening preference' };
        }
        if (preference === suggestion_dto_1.TimeOfDay.MORNING && isAfternoon) {
            return { score: 5, reason: 'Close to morning preference' };
        }
        if (preference === suggestion_dto_1.TimeOfDay.AFTERNOON && (isMorning || isEvening)) {
            return { score: 5, reason: 'Close to afternoon preference' };
        }
        return { score: -10, reason: 'Does not match time of day preference' };
    }
    scoreDayOfWeek(slot, preferredDays) {
        if (!preferredDays || preferredDays.length === 0) {
            return { score: 0 };
        }
        const dow = slot.start.getDay();
        if (preferredDays.includes(dow)) {
            return { score: 15, reason: 'Matches preferred day' };
        }
        return { score: -5, reason: 'Not a preferred day' };
    }
    scoreLoadBalance(slot, userIds, loads) {
        if (loads.length === 0) {
            return { score: 25, reason: 'No prior interviews - good balance' };
        }
        const avgInterviews = loads.reduce((sum, l) => sum + l.interviewCount, 0) / loads.length;
        const loadVariance = loads.reduce((sum, l) => sum + Math.pow(l.interviewCount - avgInterviews, 2), 0) / loads.length;
        if (loadVariance < 1) {
            return { score: 25, reason: 'Excellent load balance' };
        }
        if (loadVariance < 4) {
            return { score: 15, reason: 'Good load balance' };
        }
        if (loadVariance < 9) {
            return { score: 5, reason: 'Moderate load imbalance' };
        }
        return { score: -5, reason: 'Load imbalance may increase' };
    }
    scoreGapFromOtherInterviews(slot, otherInterviews, minGapMins) {
        const slotStart = slot.start.getTime();
        const slotEnd = slot.end.getTime();
        const minGapMs = minGapMins * 60 * 1000;
        let closestGapMs = Infinity;
        for (const interview of otherInterviews) {
            const interviewTime = interview.getTime();
            const gapBefore = slotStart - interviewTime;
            const gapAfter = interviewTime - slotEnd;
            const gap = Math.min(Math.abs(gapBefore), Math.abs(gapAfter));
            if (gap < closestGapMs) {
                closestGapMs = gap;
            }
        }
        if (closestGapMs === Infinity) {
            return { score: 10, reason: 'No other interviews scheduled' };
        }
        if (closestGapMs < minGapMs / 2) {
            return { score: -20, reason: 'Too close to another interview' };
        }
        if (closestGapMs < minGapMs) {
            return { score: -10, reason: 'Less than preferred gap' };
        }
        if (closestGapMs >= minGapMs * 2) {
            return { score: 10, reason: 'Good gap from other interviews' };
        }
        return { score: 0 };
    }
    scoreSooner(slot) {
        const now = Date.now();
        const slotStart = slot.start.getTime();
        const daysAway = (slotStart - now) / (1000 * 60 * 60 * 24);
        if (daysAway <= 1) {
            return { score: 10, reason: 'Available soon' };
        }
        if (daysAway <= 3) {
            return { score: 7, reason: 'Available within 3 days' };
        }
        if (daysAway <= 7) {
            return { score: 3, reason: 'Available this week' };
        }
        return { score: 0 };
    }
    async getInterviewerLoads(tenantId, userIds, start, end) {
        const loads = [];
        for (const userId of userIds) {
            const slots = await this.prisma.interviewSlot.findMany({
                where: {
                    tenantId,
                    status: 'BOOKED',
                    startAt: { gte: start },
                    endAt: { lte: end },
                    participants: {
                        path: ['$[*].id'],
                        array_contains: userId,
                    },
                },
            });
            const totalMinutes = slots.reduce((sum, slot) => {
                return sum + (slot.endAt.getTime() - slot.startAt.getTime()) / 60000;
            }, 0);
            loads.push({
                userId,
                interviewCount: slots.length,
                totalMinutes,
            });
        }
        return loads;
    }
    async getCandidateInterviewDates(tenantId, candidateId, start, end) {
        const interviews = await this.prisma.interview.findMany({
            where: {
                tenantId,
                candidateId,
                date: { gte: start, lte: end },
                status: { notIn: ['CANCELLED'] },
            },
            select: { date: true },
        });
        return interviews.map(i => i.date);
    }
    buildUserAvailabilityMap(slot, userIds, individualAvailability) {
        const map = {};
        for (const userId of userIds) {
            const userAvail = individualAvailability.find(a => a.userId === userId);
            if (!userAvail) {
                map[userId] = false;
                continue;
            }
            const isAvailable = userAvail.intervals.some(interval => interval.start.getTime() <= slot.start.getTime() &&
                interval.end.getTime() >= slot.end.getTime());
            map[userId] = isAvailable;
        }
        return map;
    }
};
exports.SuggestionService = SuggestionService;
exports.SuggestionService = SuggestionService = SuggestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        availability_service_1.AvailabilityService,
        busy_block_service_1.BusyBlockService,
        scheduling_rules_service_1.SchedulingRulesService])
], SuggestionService);
//# sourceMappingURL=suggestion.service.js.map