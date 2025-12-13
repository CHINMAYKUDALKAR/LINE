"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSOModule = void 0;
const common_1 = require("@nestjs/common");
const sso_service_1 = require("./sso.service");
const sso_controller_1 = require("./sso.controller");
const identity_provider_module_1 = require("../identity-provider/identity-provider.module");
const app_common_module_1 = require("../../common/app-common.module");
let SSOModule = class SSOModule {
};
exports.SSOModule = SSOModule;
exports.SSOModule = SSOModule = __decorate([
    (0, common_1.Module)({
        imports: [app_common_module_1.AppCommonModule, identity_provider_module_1.IdentityProviderModule],
        controllers: [sso_controller_1.SSOController],
        providers: [sso_service_1.SSOService],
        exports: [sso_service_1.SSOService]
    })
], SSOModule);
//# sourceMappingURL=sso.module.js.map