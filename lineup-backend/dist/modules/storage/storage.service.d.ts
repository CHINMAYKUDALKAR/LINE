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
        tenantId: string;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        filename: string;
        mimeType: string | null;
        size: number | null;
        version: number;
        status: string;
        scanStatus: string;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    listFiles(tenantId: string, dto: ListFilesDto): Promise<{
        data: {
            id: string;
            tenantId: string;
            ownerId: string | null;
            linkedType: string | null;
            linkedId: string | null;
            key: string;
            filename: string;
            mimeType: string | null;
            size: number | null;
            version: number;
            status: string;
            scanStatus: string;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
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
        tenantId: string;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        filename: string;
        mimeType: string | null;
        size: number | null;
        version: number;
        status: string;
        scanStatus: string;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    streamFile(tenantId: string, fileId: string, user: any): Promise<{
        downloadUrl: string;
        filename: string;
    }>;
    updateMetadata(tenantId: string, fileId: string, dto: UpdateFileMetadataDto): Promise<{
        id: string;
        tenantId: string;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        filename: string;
        mimeType: string | null;
        size: number | null;
        version: number;
        status: string;
        scanStatus: string;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    softDelete(tenantId: string, userId: string, fileId: string): Promise<{
        success: boolean;
    }>;
    restoreFile(tenantId: string, userId: string, fileId: string): Promise<{
        success: boolean;
    }>;
    listVersions(tenantId: string, fileId: string): Promise<{
        id: string;
        tenantId: string;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        filename: string;
        mimeType: string | null;
        size: number | null;
        version: number;
        status: string;
        scanStatus: string;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    getRecycleBin(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        ownerId: string | null;
        linkedType: string | null;
        linkedId: string | null;
        key: string;
        filename: string;
        mimeType: string | null;
        size: number | null;
        version: number;
        status: string;
        scanStatus: string;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    private generateS3Key;
    private canAccessFile;
}
