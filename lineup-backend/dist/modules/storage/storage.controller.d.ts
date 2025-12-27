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
    listFiles(req: any, dto: ListFilesDto): Promise<{
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
    getRecycleBin(req: any): Promise<{
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
    getFile(req: any, id: string): Promise<{
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
    downloadFile(req: any, id: string): Promise<{
        downloadUrl: string;
        filename: string;
    }>;
    listVersions(req: any, id: string): Promise<{
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
    updateMetadata(req: any, id: string, dto: UpdateFileMetadataDto): Promise<{
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
    deleteFile(req: any, id: string): Promise<{
        success: boolean;
    }>;
    restoreFile(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
