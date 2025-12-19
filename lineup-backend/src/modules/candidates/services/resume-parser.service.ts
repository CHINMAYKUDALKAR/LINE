import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { S3Service } from '../../../common/s3.service';
import { extractText } from '../../storage/utils/text-extract.util';

/**
 * Parse status for resume extraction
 */
export type ParseStatus = 'PARSED' | 'PARTIALLY_PARSED' | 'UNPARSABLE';

/**
 * Confidence flags for extracted fields
 */
export interface FieldConfidence {
    name: boolean;
    email: boolean;
    phone: boolean;
}

/**
 * Extracted fields from resume
 */
export interface ExtractedFields {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience?: string;
}

/**
 * Complete parsed resume result
 */
export interface ParsedResume {
    status: ParseStatus;
    fields: ExtractedFields;
    confidence: FieldConfidence;
    rawText?: string;
    fileId: string;
    filename?: string;
}

/**
 * Common technical skills for keyword matching
 */
const COMMON_SKILLS = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
    // Frontend
    'react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'nextjs', 'gatsby',
    // Backend
    'node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'spring', 'rails', 'fastapi', '.net',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'oracle',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'linux',
    // Tools
    'git', 'github', 'gitlab', 'jira', 'confluence', 'figma', 'sketch', 'postman', 'swagger',
    // Data
    'machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'spark', 'hadoop',
    // General
    'agile', 'scrum', 'rest', 'graphql', 'microservices', 'api', 'testing', 'debugging', 'problem solving',
];

@Injectable()
export class ResumeParserService {
    constructor(
        private prisma: PrismaService,
        private s3: S3Service,
    ) { }

    /**
     * Parse a single resume file
     */
    async parseResume(tenantId: string, fileId: string): Promise<ParsedResume> {
        // 1. Get file metadata from database
        const file = await this.prisma.fileObject.findFirst({
            where: { id: fileId, tenantId, deletedAt: null },
        });

        if (!file) {
            throw new NotFoundException('File not found');
        }

        // 2. Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ];

        if (!allowedTypes.includes(file.mimeType || '')) {
            throw new BadRequestException(
                `Unsupported file type: ${file.mimeType}. Only PDF and DOCX files are supported.`
            );
        }

        // 3. Download file from S3
        let buffer: Buffer;
        try {
            const stream = await this.s3.streamFile(file.key);
            buffer = await this.streamToBuffer(stream);
        } catch (error) {
            console.error('Failed to download file from S3:', error);
            return {
                status: 'UNPARSABLE',
                fields: { skills: [] },
                confidence: { name: false, email: false, phone: false },
                fileId,
                filename: file.filename,
            };
        }

        // 4. Extract text
        const rawText = await extractText(buffer, file.mimeType || 'application/pdf');

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

        // 5. Extract fields
        const email = this.extractEmail(rawText);
        const phone = this.extractPhone(rawText);
        const name = this.extractName(rawText);
        const skills = this.extractSkills(rawText);
        const experience = this.extractExperience(rawText);

        // 6. Determine status
        const hasEmail = !!email;
        const hasPhone = !!phone;
        const hasName = !!name;

        let status: ParseStatus = 'UNPARSABLE';
        if (hasEmail && hasName) {
            status = 'PARSED';
        } else if (hasEmail || hasName || hasPhone) {
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

    /**
     * Parse multiple resumes
     */
    async parseResumes(tenantId: string, fileIds: string[]): Promise<{
        results: ParsedResume[];
        summary: {
            total: number;
            parsed: number;
            partiallyParsed: number;
            unparsable: number;
        };
    }> {
        const results: ParsedResume[] = [];

        for (const fileId of fileIds) {
            try {
                const result = await this.parseResume(tenantId, fileId);
                results.push(result);
            } catch (error) {
                // Individual failures don't break the batch
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

    // ============================================
    // EXTRACTION METHODS (Regex/Heuristics)
    // ============================================

    /**
     * Extract email using RFC 5322 compliant regex
     */
    private extractEmail(text: string): string | undefined {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
        const matches = text.match(emailRegex);

        if (!matches || matches.length === 0) return undefined;

        // Filter out common non-personal emails
        const filtered = matches.filter(email => {
            const lower = email.toLowerCase();
            return !lower.includes('example.com') &&
                !lower.includes('test.com') &&
                !lower.includes('noreply') &&
                !lower.includes('info@');
        });

        return filtered[0] || matches[0];
    }

    /**
     * Extract phone number using common patterns
     */
    private extractPhone(text: string): string | undefined {
        // Match various phone formats
        const phonePatterns = [
            // International format: +1 (123) 456-7890, +91 12345 67890
            /\+?[0-9]{1,3}[-.\s]?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g,
            // US format: (123) 456-7890, 123-456-7890
            /\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
            // Indian format: 91-12345-67890, +91 9876543210
            /\+?91[-.\s]?[6-9][0-9]{9}/g,
        ];

        for (const pattern of phonePatterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                // Clean up the match
                const phone = matches[0].replace(/\s+/g, ' ').trim();
                // Validate it's actually a phone (at least 10 digits)
                const digits = phone.replace(/\D/g, '');
                if (digits.length >= 10) {
                    return phone;
                }
            }
        }

        return undefined;
    }

    /**
     * Extract name using heuristics (first lines of resume)
     */
    private extractName(text: string): string | undefined {
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && line.length < 60);

        if (lines.length === 0) return undefined;

        // Look for a line that looks like a name
        for (const line of lines.slice(0, 5)) {
            // Skip lines with emails, phones, or URLs
            if (line.includes('@') || line.includes('http') || /\d{4,}/.test(line)) {
                continue;
            }

            // Skip lines that look like headers
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('resume') ||
                lowerLine.includes('curriculum') ||
                lowerLine.includes('objective') ||
                lowerLine.includes('summary')) {
                continue;
            }

            // Check if it looks like a name (2-4 words, mostly letters)
            const words = line.split(/\s+/);
            if (words.length >= 1 && words.length <= 4) {
                const isName = words.every(word => /^[A-Za-z'-]+$/.test(word) && word.length > 1);
                if (isName) {
                    return line;
                }
            }
        }

        // Fallback: return first non-empty line that's reasonable length
        const fallback = lines.find(line =>
            line.length >= 3 &&
            line.length <= 50 &&
            !line.includes('@') &&
            !/\d{3,}/.test(line)
        );

        return fallback;
    }

    /**
     * Extract skills using keyword matching
     */
    private extractSkills(text: string): string[] {
        const lowerText = text.toLowerCase();
        const foundSkills: Set<string> = new Set();

        for (const skill of COMMON_SKILLS) {
            // Match whole word (with word boundaries)
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lowerText)) {
                // Capitalize properly
                foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
            }
        }

        return Array.from(foundSkills).slice(0, 20); // Limit to 20 skills
    }

    /**
     * Extract experience section (raw text)
     */
    private extractExperience(text: string): string | undefined {
        const lines = text.split('\n');
        const experienceHeaders = ['experience', 'work experience', 'employment', 'work history', 'professional experience'];

        let inExperienceSection = false;
        let experienceLines: string[] = [];
        let lineCount = 0;

        for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();

            // Check for experience section start
            if (!inExperienceSection) {
                for (const header of experienceHeaders) {
                    if (lowerLine.includes(header)) {
                        inExperienceSection = true;
                        break;
                    }
                }
                continue;
            }

            // Check for next section (stop collecting)
            const sectionHeaders = ['education', 'skills', 'projects', 'certifications', 'references', 'awards'];
            if (sectionHeaders.some(h => lowerLine.includes(h))) {
                break;
            }

            // Collect experience lines
            if (line.trim()) {
                experienceLines.push(line.trim());
                lineCount++;
            }

            // Limit to ~20 lines
            if (lineCount >= 20) break;
        }

        if (experienceLines.length === 0) return undefined;

        return experienceLines.join('\n').substring(0, 2000); // Limit to 2000 chars
    }

    // ============================================
    // HELPERS
    // ============================================

    private async streamToBuffer(stream: any): Promise<Buffer> {
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
}
