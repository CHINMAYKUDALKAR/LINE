import { Readable } from 'stream';
export declare class S3Service {
    private s3;
    private logger;
    private bucket;
    constructor();
    getPresignedUploadUrl(key: string, contentType?: string, expiresIn?: number): Promise<string>;
    getPresignedDownloadUrl(key: string, filename?: string, expiresIn?: number): Promise<string>;
    streamFile(key: string): Promise<Readable>;
    downloadFile(key: string): Promise<Buffer>;
    deleteFile(key: string): Promise<void>;
    copyFile(sourceKey: string, destKey: string): Promise<void>;
    getBucket(): string;
}
