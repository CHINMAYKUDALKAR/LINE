"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarModule = void 0;
const common_1 = require("@nestjs/common");
const calendar_controller_1 = require("./calendar.controller");
const prisma_service_1 = require("../../common/prisma.service");
const services_1 = require("./services");
const interviews_module_1 = require("../interviews/interviews.module");
let CalendarModule = class CalendarModule {
};
exports.CalendarModule = CalendarModule;
exports.CalendarModule = CalendarModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => interviews_module_1.InterviewsModule),
        ],
        controllers: [calendar_controller_1.CalendarController],
        providers: [
            prisma_service_1.PrismaService,
            services_1.AvailabilityService,
            services_1.BusyBlockService,
            services_1.CalendarSyncService,
            services_1.GoogleCalendarOAuthService,
            services_1.MicrosoftCalendarOAuthService,
            services_1.SchedulingRulesService,
            services_1.SlotService,
            services_1.SuggestionService,
            services_1.WorkingHoursService,
        ],
        exports: [
            services_1.AvailabilityService,
            services_1.BusyBlockService,
            services_1.CalendarSyncService,
            services_1.GoogleCalendarOAuthService,
            services_1.MicrosoftCalendarOAuthService,
            services_1.SchedulingRulesService,
            services_1.SlotService,
            services_1.SuggestionService,
            services_1.WorkingHoursService,
        ],
    })
], CalendarModule);
//# sourceMappingURL=calendar.module.js.map