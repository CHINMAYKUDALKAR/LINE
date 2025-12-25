import { PrismaService } from '../../../common/prisma.service';
export interface BulkImportResult {
    total: number;
    imported: number;
    skipped: number;
    errors: Array<{
        row: number;
        name: string;
        reason: string;
    }>;
}
export declare const startBulkImportProcessor: (prisma: PrismaService) => void;
export declare const stopBulkImportProcessor: () => Promise<void>;
