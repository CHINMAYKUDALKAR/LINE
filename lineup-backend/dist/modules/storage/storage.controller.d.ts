import { StorageService } from './storage.service';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { AttachFileDto } from './dto/attach-file.dto';
import { UpdateFileMetadataDto } from './dto/update-file-metadata.dto';
import { ListFilesDto } from './dto/list-files.dto';
export declare class StorageController {
    private storageService;
    constructor(storageService: StorageService);
    generateUploadUrl(req: any, dto: GenerateUploadUrlDto): Promise<{
        fileId: string;
        uploadUrl: string;
        s3Key: string;
    }>;
    attachFile(req: any, dto: AttachFileDto): Promise<{
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
    listFiles(req: any, dto: ListFilesDto): Promise<{
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
    getRecycleBin(req: any): Promise<{
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
    getFile(req: any, id: string): Promise<{
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
    downloadFile(req: any, id: string): Promise<{
        downloadUrl: string;
        filename: string;
    }>;
    listVersions(req: any, id: string): Promise<{
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
    updateMetadata(req: any, id: string, dto: UpdateFileMetadataDto): Promise<{
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
    deleteFile(req: any, id: string): Promise<{
        success: boolean;
    }>;
    restoreFile(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
