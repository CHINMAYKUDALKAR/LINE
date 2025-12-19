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
var TwilioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let TwilioService = TwilioService_1 = class TwilioService {
    configService;
    logger = new common_1.Logger(TwilioService_1.name);
    client = null;
    fromNumber = null;
    isMockMode = true;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.fromNumber = this.configService.get('TWILIO_FROM_NUMBER') || null;
        if (accountSid && authToken && this.fromNumber) {
            try {
                this.client = new twilio_1.Twilio(accountSid, authToken);
                this.isMockMode = false;
                this.logger.log('✅ Twilio SMS integration enabled');
            }
            catch (error) {
                this.logger.warn(`⚠️ Twilio initialization failed: ${error.message}. Using mock mode.`);
                this.isMockMode = true;
            }
        }
        else {
            this.logger.warn('⚠️ Twilio credentials not configured. SMS will be mocked.');
            this.isMockMode = true;
        }
    }
    isEnabled() {
        return !this.isMockMode && !!this.client;
    }
    async sendSms(to, body) {
        const normalizedTo = to.startsWith('+') ? to : `+${to}`;
        if (this.isMockMode) {
            return this.mockSend(normalizedTo, body);
        }
        try {
            const message = await this.client.messages.create({
                body,
                to: normalizedTo,
                from: this.fromNumber,
            });
            this.logger.log(`SMS sent successfully: ${message.sid}`);
            return {
                success: true,
                messageId: message.sid,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send SMS to ${normalizedTo}: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async mockSend(to, body) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const mockSid = `SM${Date.now()}${Math.random().toString(36).substring(2, 9)}`;
        this.logger.debug(`[MOCK SMS] To: ${to}, Body: ${body.substring(0, 50)}...`);
        return {
            success: true,
            messageId: mockSid,
        };
    }
    isValidPhoneNumber(phone) {
        const e164Regex = /^\+?[1-9]\d{1,14}$/;
        return e164Regex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = TwilioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map