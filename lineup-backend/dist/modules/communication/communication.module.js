"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const communication_controller_1 = require("./communication.controller");
const receipt_controller_1 = require("./webhooks/receipt.controller");
const message_service_1 = require("./services/message.service");
const template_service_1 = require("./services/template.service");
const automation_service_1 = require("./services/automation.service");
const channel_service_1 = require("./services/channel.service");
const scheduler_service_1 = require("./services/scheduler.service");
const variable_resolver_service_1 = require("./services/variable-resolver.service");
const twilio_service_1 = require("./services/twilio.service");
const email_processor_1 = require("./processors/email.processor");
const whatsapp_processor_1 = require("./processors/whatsapp.processor");
const sms_processor_1 = require("./processors/sms.processor");
const scheduler_processor_1 = require("./processors/scheduler.processor");
const automation_processor_1 = require("./processors/automation.processor");
const prisma_service_1 = require("../../common/prisma.service");
const queues_1 = require("./queues");
let CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule;
exports.CommunicationModule = CommunicationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule,
            bullmq_1.BullModule.registerQueue({
                name: queues_1.COMMUNICATION_QUEUES.EMAIL,
                defaultJobOptions: {
                    attempts: queues_1.QUEUE_RETRY_CONFIG.attempts,
                    backoff: queues_1.QUEUE_RETRY_CONFIG.backoff,
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }, {
                name: queues_1.COMMUNICATION_QUEUES.WHATSAPP,
                defaultJobOptions: {
                    attempts: queues_1.QUEUE_RETRY_CONFIG.attempts,
                    backoff: queues_1.QUEUE_RETRY_CONFIG.backoff,
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }, {
                name: queues_1.COMMUNICATION_QUEUES.SMS,
                defaultJobOptions: {
                    attempts: queues_1.QUEUE_RETRY_CONFIG.attempts,
                    backoff: queues_1.QUEUE_RETRY_CONFIG.backoff,
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }, {
                name: queues_1.COMMUNICATION_QUEUES.AUTOMATION,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }, {
                name: queues_1.COMMUNICATION_QUEUES.SCHEDULER,
            }, {
                name: queues_1.COMMUNICATION_QUEUES.DLQ,
            }),
        ],
        controllers: [communication_controller_1.CommunicationController, receipt_controller_1.ReceiptController],
        providers: [
            prisma_service_1.PrismaService,
            message_service_1.MessageService,
            template_service_1.TemplateService,
            automation_service_1.AutomationService,
            channel_service_1.ChannelService,
            scheduler_service_1.SchedulerService,
            variable_resolver_service_1.VariableResolverService,
            twilio_service_1.TwilioService,
            email_processor_1.EmailProcessor,
            whatsapp_processor_1.WhatsAppProcessor,
            sms_processor_1.SmsProcessor,
            scheduler_processor_1.SchedulerProcessor,
            automation_processor_1.AutomationProcessor,
        ],
        exports: [
            message_service_1.MessageService,
            template_service_1.TemplateService,
            automation_service_1.AutomationService,
            channel_service_1.ChannelService,
            variable_resolver_service_1.VariableResolverService,
            twilio_service_1.TwilioService,
        ],
    })
], CommunicationModule);
//# sourceMappingURL=communication.module.js.map