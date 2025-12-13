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
var NoShowCheckProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoShowCheckProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let NoShowCheckProcessor = NoShowCheckProcessor_1 = class NoShowCheckProcessor extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(NoShowCheckProcessor_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        if (job.name === 'check-no-shows') {
            await this.checkNoShows();
        }
    }
    async checkNoShows() {
        this.logger.log('Running No-Show check...');
        const now = new Date();
        const bufferTime = new Date(now.getTime() - 60 * 60 * 1000);
        const threshold = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        const candidates = await this.prisma.interview.findMany({
            where: {
                date: { lt: threshold },
                status: 'SCHEDULED',
                hasFeedback: false,
                isNoShow: false,
            },
            take: 100
        });
        this.logger.log(`Found ${candidates.length} potential no-shows.`);
        for (const interview of candidates) {
            const endTime = new Date(interview.date.getTime() + interview.durationMins * 60000);
            if (endTime.getTime() + 3600000 < now.getTime()) {
                await this.prisma.interview.update({
                    where: { id: interview.id },
                    data: {
                        isNoShow: true,
                        status: 'NO_SHOW'
                    }
                });
                this.logger.log(`Marked interview ${interview.id} as NO_SHOW`);
            }
        }
    }
};
exports.NoShowCheckProcessor = NoShowCheckProcessor;
exports.NoShowCheckProcessor = NoShowCheckProcessor = NoShowCheckProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)('interviews-queue'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NoShowCheckProcessor);
//# sourceMappingURL=no-show-check.processor.js.map