"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const schedule_1 = require("@nestjs/schedule");
const automation_service_1 = require("./automation.service");
const rule_processor_service_1 = require("./rule-processor.service");
const no_show_detection_processor_1 = require("./processors/no-show-detection.processor");
const prisma_service_1 = require("../../common/prisma.service");
const communication_module_1 = require("../communication/communication.module");
const candidates_module_1 = require("../candidates/candidates.module");
let AutomationModule = class AutomationModule {
};
exports.AutomationModule = AutomationModule;
exports.AutomationModule = AutomationModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            communication_module_1.CommunicationModule,
            candidates_module_1.CandidatesModule,
            schedule_1.ScheduleModule.forRoot(),
            bullmq_1.BullModule.registerQueue({ name: 'no-show-detection' })
        ],
        providers: [
            automation_service_1.AutomationService,
            rule_processor_service_1.RuleProcessor,
            no_show_detection_processor_1.NoShowDetectionProcessor,
            prisma_service_1.PrismaService
        ],
        exports: [automation_service_1.AutomationService, rule_processor_service_1.RuleProcessor],
    })
], AutomationModule);
//# sourceMappingURL=automation.module.js.map