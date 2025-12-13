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
exports.InterviewsModule = void 0;
const common_1 = require("@nestjs/common");
const interviews_service_1 = require("./interviews.service");
const interviews_controller_1 = require("./interviews.controller");
const prisma_service_1 = require("../../common/prisma.service");
const email_module_1 = require("../email/email.module");
const bullmq_1 = require("@nestjs/bullmq");
const interview_automation_service_1 = require("./services/interview-automation.service");
const queues_1 = require("../communication/queues");
const availability_util_1 = require("./utils/availability.util");
const calendar_sync_processor_1 = require("./processors/calendar-sync.processor");
const interview_reminder_processor_1 = require("./processors/interview-reminder.processor");
const no_show_check_processor_1 = require("./processors/no-show-check.processor");
const bullmq_2 = require("bullmq");
const recycle_bin_module_1 = require("../recycle-bin/recycle-bin.module");
let InterviewsModule = class InterviewsModule {
    interviewsQueue;
    constructor(interviewsQueue) {
        this.interviewsQueue = interviewsQueue;
    }
    async onModuleInit() {
        await this.interviewsQueue.removeRepeatableByKey('check-no-shows');
        await this.interviewsQueue.add('check-no-shows', {}, {
            repeat: {
                pattern: '0 * * * *',
            },
            jobId: 'check-no-shows'
        });
    }
};
exports.InterviewsModule = InterviewsModule;
exports.InterviewsModule = InterviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'interview-reminder' }),
            bullmq_1.BullModule.registerQueue({ name: 'calendar-sync' }),
            bullmq_1.BullModule.registerQueue({ name: queues_1.COMMUNICATION_QUEUES.AUTOMATION }),
            bullmq_1.BullModule.registerQueue({ name: 'interviews-queue' }),
            email_module_1.EmailModule,
            recycle_bin_module_1.RecycleBinModule,
        ],
        controllers: [interviews_controller_1.InterviewsController],
        providers: [
            interviews_service_1.InterviewsService,
            availability_util_1.AvailabilityUtil,
            interview_automation_service_1.InterviewAutomationService,
            calendar_sync_processor_1.CalendarSyncProcessor,
            interview_reminder_processor_1.InterviewReminderProcessor,
            no_show_check_processor_1.NoShowCheckProcessor,
            prisma_service_1.PrismaService,
        ],
        exports: [interviews_service_1.InterviewsService, availability_util_1.AvailabilityUtil, interview_automation_service_1.InterviewAutomationService],
    }),
    __param(0, (0, bullmq_1.InjectQueue)('interviews-queue')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], InterviewsModule);
//# sourceMappingURL=interviews.module.js.map