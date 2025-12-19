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
exports.ResumeParserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma.service");
const s3_service_1 = require("../../../common/s3.service");
const text_extract_util_1 = require("../../storage/utils/text-extract.util");
const COMMON_SKILLS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'nextjs', 'gatsby',
    'node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'spring', 'rails', 'fastapi', '.net',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'oracle',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'linux',
    'git', 'github', 'gitlab', 'jira', 'confluence', 'figma', 'sketch', 'postman', 'swagger',
    'machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'spark', 'hadoop',
    'agile', 'scrum', 'rest', 'graphql', 'microservices', 'api', 'testing', 'debugging', 'problem solving',
];
let ResumeParserService = class ResumeParserService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async parseResume(tenantId, fileId) {
        const file = await this.prisma.fileObject.findFirst({
            where: { id: fileId, tenantId, deletedAt: null },
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ];
        if (!allowedTypes.includes(file.mimeType || '')) {
            throw new common_1.BadRequestException(`Unsupported file type: ${file.mimeType}. Only PDF and DOCX files are supported.`);
        }
        let buffer;
        try {
            const stream = await this.s3.streamFile(file.key);
            buffer = await this.streamToBuffer(stream);
        }
        catch (error) {
            console.error('Failed to download file from S3:', error);
            return {
                status: 'UNPARSABLE',
                fields: { skills: [] },
                confidence: { name: false, email: false, phone: false },
                fileId,
                filename: file.filename,
            };
        }
        const rawText = await (0, text_extract_util_1.extractText)(buffer, file.mimeType || 'application/pdf');
        if (!rawText || rawText.trim().length < 10) {
            return {
                status: 'UNPARSABLE',
                fields: { skills: [] },
                confidence: { name: false, email: false, phone: false },
                rawText: rawText || '',
                fileId,
                filename: file.filename,
            };
        }
        const email = this.extractEmail(rawText);
        const phone = this.extractPhone(rawText);
        const name = this.extractName(rawText);
        const skills = this.extractSkills(rawText);
        const experience = this.extractExperience(rawText);
        const hasEmail = !!email;
        const hasPhone = !!phone;
        const hasName = !!name;
        let status = 'UNPARSABLE';
        if (hasEmail && hasName) {
            status = 'PARSED';
        }
        else if (hasEmail || hasName || hasPhone) {
            status = 'PARTIALLY_PARSED';
        }
        return {
            status,
            fields: {
                name,
                email,
                phone,
                skills,
                experience,
            },
            confidence: {
                name: hasName,
                email: hasEmail,
                phone: hasPhone,
            },
            rawText,
            fileId,
            filename: file.filename,
        };
    }
    async parseResumes(tenantId, fileIds) {
        const results = [];
        for (const fileId of fileIds) {
            try {
                const result = await this.parseResume(tenantId, fileId);
                results.push(result);
            }
            catch (error) {
                results.push({
                    status: 'UNPARSABLE',
                    fields: { skills: [] },
                    confidence: { name: false, email: false, phone: false },
                    fileId,
                });
            }
        }
        const summary = {
            total: results.length,
            parsed: results.filter(r => r.status === 'PARSED').length,
            partiallyParsed: results.filter(r => r.status === 'PARTIALLY_PARSED').length,
            unparsable: results.filter(r => r.status === 'UNPARSABLE').length,
        };
        return { results, summary };
    }
    extractEmail(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
        const matches = text.match(emailRegex);
        if (!matches || matches.length === 0)
            return undefined;
        const filtered = matches.filter(email => {
            const lower = email.toLowerCase();
            return !lower.includes('example.com') &&
                !lower.includes('test.com') &&
                !lower.includes('noreply') &&
                !lower.includes('info@');
        });
        return filtered[0] || matches[0];
    }
    extractPhone(text) {
        const phonePatterns = [
            /\+?[0-9]{1,3}[-.\s]?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g,
            /\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
            /\+?91[-.\s]?[6-9][0-9]{9}/g,
        ];
        for (const pattern of phonePatterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                const phone = matches[0].replace(/\s+/g, ' ').trim();
                const digits = phone.replace(/\D/g, '');
                if (digits.length >= 10) {
                    return phone;
                }
            }
        }
        return undefined;
    }
    extractName(text) {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && line.length < 60);
        if (lines.length === 0)
            return undefined;
        for (const line of lines.slice(0, 5)) {
            if (line.includes('@') || line.includes('http') || /\d{4,}/.test(line)) {
                continue;
            }
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('resume') ||
                lowerLine.includes('curriculum') ||
                lowerLine.includes('objective') ||
                lowerLine.includes('summary')) {
                continue;
            }
            const words = line.split(/\s+/);
            if (words.length >= 1 && words.length <= 4) {
                const isName = words.every(word => /^[A-Za-z'-]+$/.test(word) && word.length > 1);
                if (isName) {
                    return line;
                }
            }
        }
        const fallback = lines.find(line => line.length >= 3 &&
            line.length <= 50 &&
            !line.includes('@') &&
            !/\d{3,}/.test(line));
        return fallback;
    }
    extractSkills(text) {
        const lowerText = text.toLowerCase();
        const foundSkills = new Set();
        for (const skill of COMMON_SKILLS) {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lowerText)) {
                foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
            }
        }
        return Array.from(foundSkills).slice(0, 20);
    }
    extractExperience(text) {
        const lines = text.split('\n');
        const experienceHeaders = ['experience', 'work experience', 'employment', 'work history', 'professional experience'];
        let inExperienceSection = false;
        let experienceLines = [];
        let lineCount = 0;
        for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();
            if (!inExperienceSection) {
                for (const header of experienceHeaders) {
                    if (lowerLine.includes(header)) {
                        inExperienceSection = true;
                        break;
                    }
                }
                continue;
            }
            const sectionHeaders = ['education', 'skills', 'projects', 'certifications', 'references', 'awards'];
            if (sectionHeaders.some(h => lowerLine.includes(h))) {
                break;
            }
            if (line.trim()) {
                experienceLines.push(line.trim());
                lineCount++;
            }
            if (lineCount >= 20)
                break;
        }
        if (experienceLines.length === 0)
            return undefined;
        return experienceLines.join('\n').substring(0, 2000);
    }
    async streamToBuffer(stream) {
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
};
exports.ResumeParserService = ResumeParserService;
exports.ResumeParserService = ResumeParserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], ResumeParserService);
//# sourceMappingURL=resume-parser.service.js.map