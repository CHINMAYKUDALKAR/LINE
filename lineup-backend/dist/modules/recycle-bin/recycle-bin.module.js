"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecycleBinModule = void 0;
const common_1 = require("@nestjs/common");
const recycle_bin_service_1 = require("./recycle-bin.service");
const recycle_bin_controller_1 = require("./recycle-bin.controller");
const app_common_module_1 = require("../../common/app-common.module");
let RecycleBinModule = class RecycleBinModule {
};
exports.RecycleBinModule = RecycleBinModule;
exports.RecycleBinModule = RecycleBinModule = __decorate([
    (0, common_1.Module)({
        imports: [app_common_module_1.AppCommonModule],
        controllers: [recycle_bin_controller_1.RecycleBinController],
        providers: [recycle_bin_service_1.RecycleBinService],
        exports: [recycle_bin_service_1.RecycleBinService],
    })
], RecycleBinModule);
//# sourceMappingURL=recycle-bin.module.js.map