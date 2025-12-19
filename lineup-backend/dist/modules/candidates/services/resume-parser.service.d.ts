import { PrismaService } from '../../../common/prisma.service';
import { S3Service } from '../../../common/s3.service';
export type ParseStatus = 'PARSED' | 'PARTIALLY_PARSED' | 'UNPARSABLE';
export interface FieldConfidence {
    name: boolean;
    email: boolean;
    phone: boolean;
}
export interface ExtractedFields {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience?: string;
}
export interface ParsedResume {
    status: ParseStatus;
    fields: ExtractedFields;
    confidence: FieldConfidence;
    rawText?: string;
    fileId: string;
    filename?: string;
}
export declare class ResumeParserService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    parseResume(tenantId: string, fileId: string): Promise<ParsedResume>;
    parseResumes(tenantId: string, fileIds: string[]): Promise<{
        results: ParsedResume[];
        summary: {
            total: number;
            parsed: number;
            partiallyParsed: number;
            unparsable: number;
        };
    }>;
    private extractEmail;
    private extractPhone;
    private extractName;
    private extractSkills;
    private extractExperience;
    private streamToBuffer;
}
