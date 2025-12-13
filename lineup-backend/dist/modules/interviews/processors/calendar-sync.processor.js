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
var CalendarSyncProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarSyncProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let CalendarSyncProcessor = CalendarSyncProcessor_1 = class CalendarSyncProcessor extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(CalendarSyncProcessor_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        this.logger.log(`Syncing calendar for interview ${job.data.interviewId}`);
    }
};
exports.CalendarSyncProcessor = CalendarSyncProcessor;
exports.CalendarSyncProcessor = CalendarSyncProcessor = CalendarSyncProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('calendar-sync'),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarSyncProcessor);
//# sourceMappingURL=calendar-sync.processor.js.map