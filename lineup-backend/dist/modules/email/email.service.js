"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const template_util_1 = require("./utils/template.util");
const email_queue_1 = require("./email.queue");
const prisma_service_1 = require("../../common/prisma.service");
const token_util_1 = require("./utils/token.util");
const client_ses_1 = require("@aws-sdk/client-ses");
let EmailService = class EmailService {
    prisma;
    queue;
    constructor(prisma) {
        this.prisma = prisma;
        this.queue = new email_queue_1.EmailQueue();
    }
    async enqueue(tenantId, payload) {
        return this.queue.getQueue().add('send', {
            tenantId,
            to: payload.to,
            template: payload.template,
            context: payload.context,
            attachments: payload.attachments || []
        });
    }
    async sendMail(tenantId, opts) {
        const { subject, body } = (0, template_util_1.renderTemplate)(opts.template, opts.context);
        let transportOptions = null;
        if (tenantId) {
            const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
            const smtp = tenant?.settings?.smtp;
            if (!smtp || !smtp.host) {
                transportOptions = this.globalSmtp();
            }
            else {
                transportOptions = this.smtpFromSettings(smtp);
            }
        }
        else {
            transportOptions = this.globalSmtp();
        }
        if (!transportOptions)
            transportOptions = this.globalSmtp();
        if (!transportOptions)
            throw new common_1.BadRequestException('No SMTP configuration available');
        if (transportOptions.type === 'ses') {
            const client = new client_ses_1.SESClient({ region: transportOptions.region });
            const params = {
                Destination: { ToAddresses: [opts.to] },
                Message: {
                    Body: { Html: { Charset: 'UTF-8', Data: body } },
                    Subject: { Charset: 'UTF-8', Data: subject }
                },
                Source: transportOptions.from
            };
            const cmd = new client_ses_1.SendEmailCommand(params);
            const res = await client.send(cmd);
            return res;
        }
        const transporter = nodemailer.createTransport({
            host: transportOptions.host,
            port: Number(transportOptions.port || 587),
            secure: !!transportOptions.secure,
            auth: transportOptions.auth ? {
                user: transportOptions.auth.user,
                pass: transportOptions.auth.pass
            } : undefined,
            tls: transportOptions.tls || undefined
        });
        const mail = {
            from: transportOptions.from || process.env.DEFAULT_FROM_ADDRESS || 'no-reply@lineup.example',
            to: opts.to,
            subject,
            html: body,
            attachments: opts.attachments || []
        };
        const result = await transporter.sendMail(mail);
        return result;
    }
    smtpFromSettings(smtp) {
        return {
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure || false,
            auth: smtp.username ? { user: smtp.username, pass: smtp.password } : undefined,
            from: smtp.fromAddress
        };
    }
    globalSmtp() {
        if (process.env.EMAIL_PROVIDER === 'ses') {
            return { type: 'ses', region: process.env.AWS_REGION, from: process.env.SES_FROM };
        }
        if (process.env.SMTP_HOST) {
            const hasAuth = process.env.SMTP_USER && process.env.SMTP_PASS;
            return {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE === 'true',
                auth: hasAuth ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
                from: process.env.DEFAULT_FROM_ADDRESS
            };
        }
        return null;
    }
    async sendOnboardingEmail(tenantId, to, name, tenantName, setupPayload) {
        const setupLink = (0, token_util_1.createSignedLink)(setupPayload, '24h');
        const context = { name, tenantName, setupLink };
        return this.enqueue(tenantId, { to, template: 'onboarding', context });
    }
    previewTemplate(template, context) {
        return (0, template_util_1.renderTemplate)(template, context);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailService);
//# sourceMappingURL=email.service.js.map