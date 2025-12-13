"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const invitation_service_1 = require("./invitation.service");
const password_reset_service_1 = require("./password-reset.service");
const prisma_service_1 = require("../../common/prisma.service");
const email_module_1 = require("../email/email.module");
const brute_force_guard_1 = require("../../common/brute-force.guard");
const password_policy_service_1 = require("../../common/password-policy.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [email_module_1.EmailModule],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            invitation_service_1.InvitationService,
            password_reset_service_1.PasswordResetService,
            prisma_service_1.PrismaService,
            brute_force_guard_1.BruteForceService,
            password_policy_service_1.PasswordPolicyService,
        ],
        exports: [auth_service_1.AuthService, invitation_service_1.InvitationService, brute_force_guard_1.BruteForceService, password_policy_service_1.PasswordPolicyService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map