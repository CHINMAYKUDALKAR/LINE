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
exports.VariableResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
let VariableResolverService = class VariableResolverService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveForInterview(tenantId, interviewId, interviewerId) {
        const interview = await this.prisma.interview.findFirst({
            where: { id: interviewId, tenantId },
            include: { candidate: true },
        });
        if (!interview) {
            throw new Error(`Interview ${interviewId} not found`);
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        let interviewer = null;
        const interviewerIdToUse = interviewerId || interview.interviewerIds[0];
        if (interviewerIdToUse) {
            interviewer = await this.prisma.user.findFirst({
                where: { id: interviewerIdToUse, tenantId },
            });
        }
        const interviewDate = new Date(interview.date);
        return {
            candidate: {
                name: interview.candidate?.name || 'Candidate',
                email: interview.candidate?.email || '',
                phone: interview.candidate?.phone || undefined,
            },
            interviewer: {
                name: interviewer?.name || 'Interviewer',
                email: interviewer?.email || '',
            },
            interview: {
                id: interview.id,
                date: interviewDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                time: interviewDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                duration: interview.durationMins,
                stage: interview.stage,
                link: interview.meetingLink || undefined,
            },
            company: {
                name: tenant?.name || 'Company',
            },
        };
    }
    flatten(vars) {
        return {
            'candidate.name': vars.candidate.name,
            'candidate.email': vars.candidate.email,
            'candidate.phone': vars.candidate.phone,
            'interviewer.name': vars.interviewer.name,
            'interviewer.email': vars.interviewer.email,
            'interview.date': vars.interview.date,
            'interview.time': vars.interview.time,
            'interview.duration': vars.interview.duration,
            'interview.stage': vars.interview.stage,
            'interview.link': vars.interview.link,
            'company.name': vars.company.name,
            candidate: vars.candidate,
            interviewer: vars.interviewer,
            interview: vars.interview,
            company: vars.company,
        };
    }
};
exports.VariableResolverService = VariableResolverService;
exports.VariableResolverService = VariableResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VariableResolverService);
//# sourceMappingURL=variable-resolver.service.js.map