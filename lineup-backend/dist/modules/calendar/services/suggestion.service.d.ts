import { PrismaService } from '../../../common/prisma.service';
import { AvailabilityService } from './availability.service';
import { BusyBlockService } from './busy-block.service';
import { SchedulingRulesService } from './scheduling-rules.service';
import { SuggestionQueryDto, SuggestionResponseDto, TeamAvailabilityQueryDto, TeamAvailabilityResponseDto } from '../dto/suggestion.dto';
export declare class SuggestionService {
    private prisma;
    private availabilityService;
    private busyBlockService;
    private schedulingRulesService;
    private readonly logger;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService, busyBlockService: BusyBlockService, schedulingRulesService: SchedulingRulesService);
    getSuggestions(tenantId: string, dto: SuggestionQueryDto): Promise<SuggestionResponseDto>;
    getTeamAvailability(tenantId: string, dto: TeamAvailabilityQueryDto): Promise<TeamAvailabilityResponseDto>;
    private rankSlots;
    private scoreTimeOfDay;
    private scoreDayOfWeek;
    private scoreLoadBalance;
    private scoreGapFromOtherInterviews;
    private scoreSooner;
    private getInterviewerLoads;
    private getCandidateInterviewDates;
    private buildUserAvailabilityMap;
}
