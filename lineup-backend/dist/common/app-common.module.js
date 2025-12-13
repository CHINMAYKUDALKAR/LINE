"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppCommonModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const brute_force_guard_1 = require("./brute-force.guard");
const password_policy_service_1 = require("./password-policy.service");
const ip_allowlist_guard_1 = require("./ip-allowlist.guard");
const s3_service_1 = require("./s3.service");
const ioredis_1 = __importDefault(require("ioredis"));
let AppCommonModule = class AppCommonModule {
};
exports.AppCommonModule = AppCommonModule;
exports.AppCommonModule = AppCommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            s3_service_1.S3Service,
            brute_force_guard_1.BruteForceService,
            password_policy_service_1.PasswordPolicyService,
            ip_allowlist_guard_1.IPAllowlistService,
            {
                provide: 'REDIS_CLIENT',
                useFactory: () => {
                    return new ioredis_1.default({
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379'),
                    });
                },
            },
        ],
        exports: [
            prisma_service_1.PrismaService,
            s3_service_1.S3Service,
            brute_force_guard_1.BruteForceService,
            password_policy_service_1.PasswordPolicyService,
            ip_allowlist_guard_1.IPAllowlistService,
            'REDIS_CLIENT',
        ],
    })
], AppCommonModule);
//# sourceMappingURL=app-common.module.js.map