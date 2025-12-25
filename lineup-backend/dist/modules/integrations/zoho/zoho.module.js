"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const zoho_controller_1 = require("./zoho.controller");
const zoho_oauth_service_1 = require("./zoho.oauth.service");
const zoho_sync_service_1 = require("./zoho.sync.service");
const zoho_fieldmap_service_1 = require("./zoho.fieldmap.service");
const zoho_webhook_service_1 = require("./zoho.webhook.service");
const prisma_service_1 = require("../../../common/prisma.service");
let ZohoModule = class ZohoModule {
};
exports.ZohoModule = ZohoModule;
exports.ZohoModule = ZohoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: 'zoho-sync' }),
        ],
        controllers: [zoho_controller_1.ZohoController],
        providers: [
            prisma_service_1.PrismaService,
            zoho_oauth_service_1.ZohoOAuthService,
            zoho_sync_service_1.ZohoSyncService,
            zoho_fieldmap_service_1.ZohoFieldMapService,
            zoho_webhook_service_1.ZohoWebhookService,
        ],
        exports: [zoho_sync_service_1.ZohoSyncService]
    })
], ZohoModule);
//# sourceMappingURL=zoho.module.js.map