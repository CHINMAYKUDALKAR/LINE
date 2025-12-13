"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
class InterviewsQueue {
    queue;
    constructor() {
        const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        this.queue = new bullmq_1.Queue('interviews', { connection });
    }
    getQueue() {
        return this.queue;
    }
}
exports.InterviewsQueue = InterviewsQueue;
//# sourceMappingURL=interviews.queue.js.map