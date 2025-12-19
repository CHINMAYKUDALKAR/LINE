export declare class ParseResumeDto {
    fileId: string;
}
export declare class BulkParseResumesDto {
    fileIds: string[];
}
export declare class FieldConfidenceDto {
    name: boolean;
    email: boolean;
    phone: boolean;
}
export declare class ExtractedFieldsDto {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience?: string;
}
export declare class ParsedResumeResponseDto {
    status: 'PARSED' | 'PARTIALLY_PARSED' | 'UNPARSABLE';
    fields: ExtractedFieldsDto;
    confidence: FieldConfidenceDto;
    rawText?: string;
    fileId: string;
    filename?: string;
}
export declare class BulkParseSummaryDto {
    total: number;
    parsed: number;
    partiallyParsed: number;
    unparsable: number;
}
export declare class BulkParseResponseDto {
    results: ParsedResumeResponseDto[];
    summary: BulkParseSummaryDto;
}
export declare class CreateCandidateFromResumeDto {
    fileId: string;
    name: string;
    email?: string;
    phone?: string;
    skills?: string[];
    roleTitle?: string;
    stage?: string;
}
