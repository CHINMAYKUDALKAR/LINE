"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_RETRY_CONFIG = exports.COMMUNICATION_QUEUES = void 0;
exports.COMMUNICATION_QUEUES = {
    EMAIL: 'email-queue',
    WHATSAPP: 'whatsapp-queue',
    SMS: 'sms-queue',
    AUTOMATION: 'automation-queue',
    SCHEDULER: 'scheduler-queue',
    DLQ: 'communication-dlq',
};
exports.QUEUE_RETRY_CONFIG = {
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 1000,
    },
};
//# sourceMappingURL=queues.js.map