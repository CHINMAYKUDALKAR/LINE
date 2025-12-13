"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
class CandidatesQueue {
    queue;
    constructor() {
        const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        this.queue = new bullmq_1.Queue('candidates', { connection });
    }
    getQueue() {
        return this.queue;
    }
}
exports.CandidatesQueue = CandidatesQueue;
//# sourceMappingURL=candidates.queue.js.map