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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const webhook_service_1 = require("./webhook.service");
const ALLOWED_PROVIDERS = ['zoho', 'google_calendar', 'outlook_calendar', 'slack', 'greenhouse', 'lever'];
let WebhookController = WebhookController_1 = class WebhookController {
    webhookService;
    logger = new common_1.Logger(WebhookController_1.name);
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    async receiveWebhook(provider, payload) {
        if (!ALLOWED_PROVIDERS.includes(provider.toLowerCase())) {
            this.logger.warn(`Rejected webhook from unknown provider: ${provider}`);
            throw new common_1.BadRequestException(`Unknown provider: ${provider}`);
        }
        return this.webhookService.handle(provider.toLowerCase(), payload);
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)(':provider'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "receiveWebhook", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, common_1.Controller)('api/v1/integrations/webhooks'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map