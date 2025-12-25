import { PrismaService } from '../../../common/prisma.service';
export declare const startBulkImportProcessor: (prisma: PrismaService) => void;
export declare const stopBulkImportProcessor: () => Promise<void>;
