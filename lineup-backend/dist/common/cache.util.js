"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
exports.getCached = getCached;
exports.setCached = setCached;
exports.invalidateCache = invalidateCache;
const ioredis_1 = __importDefault(require("ioredis"));
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('CacheUtil');
const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
exports.cache = new ioredis_1.default(redisUrl);
exports.cache.on('error', (err) => {
    logger.error(`Redis error: ${err.message}`);
});
async function getCached(key) {
    const data = await exports.cache.get(key);
    return data ? JSON.parse(data) : null;
}
async function setCached(key, value, ttlSec = 3600) {
    await exports.cache.set(key, JSON.stringify(value), 'EX', ttlSec);
}
async function invalidateCache(pattern) {
    const stream = exports.cache.scanStream({ match: pattern });
    stream.on('data', async (keys) => {
        if (keys.length) {
            await exports.cache.unlink(keys);
        }
    });
}
//# sourceMappingURL=cache.util.js.map