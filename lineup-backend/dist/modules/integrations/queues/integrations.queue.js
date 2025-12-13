"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
class IntegrationsQueue {
    queue;
    constructor() {
        const conn = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null
        });
        this.queue = new bullmq_1.Queue('integrations', { connection: conn });
    }
    getQueue() { return this.queue; }
}
exports.IntegrationsQueue = IntegrationsQueue;
//# sourceMappingURL=integrations.queue.js.map