"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../../common/prisma.service");
const s3_service_1 = require("../../common/s3.service");
const storage_service_1 = require("./storage.service");
const storage_controller_1 = require("./storage.controller");
const file_scan_processor_1 = require("./processors/file-scan.processor");
const text_extract_processor_1 = require("./processors/text-extract.processor");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'file-scan',
            }, {
                name: 'file-text-extract',
            }),
        ],
        controllers: [storage_controller_1.StorageController],
        providers: [
            prisma_service_1.PrismaService,
            s3_service_1.S3Service,
            storage_service_1.StorageService,
            file_scan_processor_1.FileScanProcessor,
            text_extract_processor_1.TextExtractProcessor,
        ],
        exports: [storage_service_1.StorageService],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map