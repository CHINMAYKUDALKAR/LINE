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
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const Handlebars = __importStar(require("handlebars"));
let TemplateService = class TemplateService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        this.registerHelpers();
    }
    async findAll(tenantId, channel, category) {
        const where = { tenantId };
        if (channel)
            where.channel = channel;
        if (category)
            where.category = category;
        return this.prisma.messageTemplate.findMany({
            where,
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
    async findOne(tenantId, id) {
        const template = await this.prisma.messageTemplate.findFirst({
            where: { id, tenantId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        return template;
    }
    async create(tenantId, dto, userId) {
        const existing = await this.prisma.messageTemplate.findFirst({
            where: { tenantId, name: dto.name, channel: dto.channel },
        });
        if (existing) {
            throw new common_1.ConflictException('A template with this name already exists for this channel');
        }
        const extractedVars = this.extractVariables(dto.body);
        const variables = dto.variables?.length ? dto.variables : extractedVars;
        return this.prisma.messageTemplate.create({
            data: {
                tenantId,
                name: dto.name,
                channel: dto.channel,
                category: dto.category,
                subject: dto.subject,
                body: dto.body,
                variables,
                createdById: userId,
            },
        });
    }
    async update(tenantId, id, dto) {
        const template = await this.findOne(tenantId, id);
        if (template.isSystem) {
            throw new common_1.BadRequestException('System templates cannot be modified');
        }
        if (dto.name && dto.name !== template.name) {
            const existing = await this.prisma.messageTemplate.findFirst({
                where: {
                    tenantId,
                    name: dto.name,
                    channel: template.channel,
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('A template with this name already exists');
            }
        }
        let variables = template.variables;
        if (dto.body) {
            variables = this.extractVariables(dto.body);
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.messageTemplate.update({
                where: { id },
                data: {
                    ...dto,
                    variables,
                    version: { increment: 1 },
                },
            });
            await tx.messageTemplate.create({
                data: {
                    tenantId,
                    name: template.name,
                    channel: template.channel,
                    category: template.category,
                    subject: template.subject,
                    body: template.body,
                    variables: template.variables,
                    createdById: template.createdById,
                    createdAt: template.createdAt,
                    version: template.version,
                    isSystem: false,
                    isActive: false,
                }
            });
            return updated;
        });
    }
    async delete(tenantId, id) {
        const template = await this.findOne(tenantId, id);
        if (template.isSystem) {
            throw new common_1.BadRequestException('System templates cannot be deleted');
        }
        const usedByRules = await this.prisma.automationRule.count({
            where: { templateId: id },
        });
        if (usedByRules > 0) {
            throw new common_1.BadRequestException(`This template is used by ${usedByRules} automation rule(s). Remove those first.`);
        }
        return this.prisma.messageTemplate.delete({ where: { id } });
    }
    async duplicate(tenantId, id, newName) {
        const template = await this.findOne(tenantId, id);
        return this.prisma.messageTemplate.create({
            data: {
                tenantId,
                name: newName,
                channel: template.channel,
                category: template.category,
                subject: template.subject,
                body: template.body,
                variables: template.variables,
                isSystem: false,
                version: 1,
            },
        });
    }
    preview(template, context) {
        const renderedSubject = template.subject ? this.render(template.subject, context) : '';
        const renderedBody = this.render(template.body, context);
        return {
            subject: renderedSubject,
            body: renderedBody,
        };
    }
    render(templateString, context) {
        try {
            const compiled = Handlebars.compile(templateString, { strict: false });
            return compiled(context);
        }
        catch (error) {
            console.error('Template rendering error:', error);
            return templateString;
        }
    }
    getAvailableVariables() {
        return {
            candidate: [
                { name: 'candidate.name', description: 'Candidate full name' },
                { name: 'candidate.email', description: 'Candidate email' },
                { name: 'candidate.phone', description: 'Candidate phone' },
                { name: 'candidate.roleTitle', description: 'Applied role/position' },
            ],
            interview: [
                { name: 'interview.date', description: 'Interview date (formatted)' },
                { name: 'interview.time', description: 'Interview time' },
                { name: 'interview.duration', description: 'Duration in minutes' },
                { name: 'interview.stage', description: 'Interview stage' },
                { name: 'interview.link', description: 'Meeting link' },
            ],
            interviewer: [
                { name: 'interviewer.name', description: 'Interviewer name' },
                { name: 'interviewer.email', description: 'Interviewer email' },
            ],
            company: [
                { name: 'company.name', description: 'Company name' },
                { name: 'company.domain', description: 'Company domain' },
            ],
            portal: [
                { name: 'portal.link', description: 'Candidate portal link' },
            ],
        };
    }
    async getVersions(tenantId, name, channel) {
        return this.prisma.messageTemplate.findMany({
            where: { tenantId, name, channel },
            orderBy: { version: 'desc' },
        });
    }
    extractVariables(templateString) {
        const regex = /\{\{([^}]+)\}\}/g;
        const variables = new Set();
        let match;
        while ((match = regex.exec(templateString)) !== null) {
            const varName = match[1].trim().split(' ')[0];
            if (!varName.startsWith('#') && !varName.startsWith('/')) {
                variables.add(varName);
            }
        }
        return Array.from(variables);
    }
    registerHelpers() {
        Handlebars.registerHelper('formatDate', (date, format) => {
            if (!date)
                return '';
            const d = new Date(date);
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        });
        Handlebars.registerHelper('formatTime', (date) => {
            if (!date)
                return '';
            const d = new Date(date);
            return d.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        });
        Handlebars.registerHelper('uppercase', (str) => {
            return str ? str.toUpperCase() : '';
        });
        Handlebars.registerHelper('lowercase', (str) => {
            return str ? str.toLowerCase() : '';
        });
        Handlebars.registerHelper('capitalize', (str) => {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        });
        Handlebars.registerHelper('default', (value, defaultValue) => {
            return value || defaultValue;
        });
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateService);
//# sourceMappingURL=template.service.js.map