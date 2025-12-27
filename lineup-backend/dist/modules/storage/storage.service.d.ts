import { PrismaService } from '../../common/prisma.service';
import { S3Service } from '../../common/s3.service';
import { Queue } from 'bullmq';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { AttachFileDto } from './dto/attach-file.dto';
import { UpdateFileMetadataDto } from './dto/update-file-metadata.dto';
import { ListFilesDto } from './dto/list-files.dto';
export declare class StorageService {
    private prisma;
    private s3;
    private scanQueue;
    private extractQueue;
    constructor(prisma: PrismaService, s3: S3Service, scanQueue: Queue, extractQueue: Queue);
    generateUploadUrl(tenantId: string, userId: string, dto: GenerateUploadUrlDto): Promise<{
        fileId: string;
        uploadUrl: string;
        s3Key: string;
    }>;
    attachFile(tenantId: string, userId: string, dto: AttachFileDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        version: number;
        tenantId: string;
        status: string;
        filename: string;
        deletedAt: Date | null;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        mimeType: string | null;
        size: number | null;
        scanStatus: string;
    }>;
    listFiles(tenantId: string, dto: ListFilesDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            version: number;
            tenantId: string;
            status: string;
            filename: string;
            deletedAt: Date | null;
            ownerId: string | null;
            linkedType: string | null;
            linkedId: string | null;
            key: string;
            mimeType: string | null;
            size: number | null;
            scanStatus: string;
        }[];
        meta: {
            total: number;
            page: number;
            perPage: number;
            lastPage: number;
        };
    }>;
    getFile(tenantId: string, fileId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        version: number;
        tenantId: string;
        status: string;
        filename: string;
        deletedAt: Date | null;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        mimeType: string | null;
        size: number | null;
        scanStatus: string;
    }>;
    streamFile(tenantId: string, fileId: string, user: any): Promise<{
        downloadUrl: string;
        filename: string;
    }>;
    downloadFile(key: string): Promise<Buffer>;
    updateMetadata(tenantId: string, fileId: string, dto: UpdateFileMetadataDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        version: number;
        tenantId: string;
        status: string;
        filename: string;
        deletedAt: Date | null;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        mimeType: string | null;
        size: number | null;
        scanStatus: string;
    }>;
    softDelete(tenantId: string, userId: string, fileId: string): Promise<{
        success: boolean;
    }>;
    restoreFile(tenantId: string, userId: string, fileId: string): Promise<{
        success: boolean;
    }>;
    listVersions(tenantId: string, fileId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        version: number;
        tenantId: string;
        status: string;
        filename: string;
        deletedAt: Date | null;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        mimeType: string | null;
        size: number | null;
        scanStatus: string;
    }[]>;
    getRecycleBin(tenantId: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        version: number;
        tenantId: string;
        status: string;
        filename: string;
        deletedAt: Date | null;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        mimeType: string | null;
        size: number | null;
        scanStatus: string;
    }[]>;
    private sanitizeFilename;
    private generateS3Key;
    private canAccessFile;
}
