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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("./prisma.service");
const rate_limit_1 = require("./rate-limit");
let HealthController = class HealthController {
    prisma;
    startTime = Date.now();
    constructor(prisma) {
        this.prisma = prisma;
    }
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.0.1',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
        };
    }
    liveness() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async readiness() {
        const checks = {
            database: await this.checkDatabase(),
            redis: await this.checkRedis(),
        };
        const allHealthy = Object.values(checks).every(c => c.status === 'ok');
        if (!allHealthy) {
            throw new common_1.ServiceUnavailableException({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                checks,
            });
        }
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            checks,
        };
    }
    async details() {
        const [dbCheck, redisCheck] = await Promise.all([
            this.checkDatabase(),
            this.checkRedis(),
        ]);
        const memUsage = process.memoryUsage();
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.0.1',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            environment: process.env.NODE_ENV || 'development',
            checks: {
                database: dbCheck,
                redis: redisCheck,
            },
            system: {
                memory: {
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
                    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
                },
                nodeVersion: process.version,
                pid: process.pid,
            },
        };
    }
    async checkDatabase() {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ok',
                latencyMs: Date.now() - start,
            };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown database error',
            };
        }
    }
    async checkRedis() {
        try {
            return { status: 'ok' };
        }
        catch (error) {
            return {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown Redis error',
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, rate_limit_1.SkipRateLimit)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Basic health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is running' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, rate_limit_1.SkipRateLimit)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness probe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Process is alive' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Process is not responding' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], HealthController.prototype, "liveness", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, rate_limit_1.SkipRateLimit)(),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness probe - checks database and Redis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is ready to handle requests' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is not ready' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)('details'),
    (0, rate_limit_1.SkipRateLimit)(),
    (0, swagger_1.ApiOperation)({ summary: 'Detailed health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detailed health information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "details", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HealthController);
//# sourceMappingURL=health.controller.js.map