export declare function getMimeType(filename: string): string;
export declare function getExtension(mimeType: string): string;
export declare function isAllowedMimeType(mimeType: string, linkedType?: string): boolean;
export declare function validateFileSize(size: number, maxSizeMB?: number): boolean;
