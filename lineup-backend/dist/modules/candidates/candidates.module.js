"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidatesModule = void 0;
const common_1 = require("@nestjs/common");
const candidates_service_1 = require("./candidates.service");
const candidates_controller_1 = require("./candidates.controller");
const candidate_import_processor_1 = require("./processors/candidate-import.processor");
const stage_transition_service_1 = require("./services/stage-transition.service");
const resume_parser_service_1 = require("./services/resume-parser.service");
const prisma_service_1 = require("../../common/prisma.service");
const s3_service_1 = require("../../common/s3.service");
const email_module_1 = require("../email/email.module");
const storage_module_1 = require("../storage/storage.module");
const bullmq_1 = require("@nestjs/bullmq");
const recycle_bin_module_1 = require("../recycle-bin/recycle-bin.module");
let CandidatesModule = class CandidatesModule {
};
exports.CandidatesModule = CandidatesModule;
exports.CandidatesModule = CandidatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'candidate-import',
            }),
            recycle_bin_module_1.RecycleBinModule,
            email_module_1.EmailModule,
            storage_module_1.StorageModule,
        ],
        controllers: [candidates_controller_1.CandidatesController],
        providers: [candidates_service_1.CandidatesService, stage_transition_service_1.StageTransitionService, resume_parser_service_1.ResumeParserService, prisma_service_1.PrismaService, s3_service_1.S3Service, candidate_import_processor_1.CandidateImportProcessor],
        exports: [candidates_service_1.CandidatesService, stage_transition_service_1.StageTransitionService, resume_parser_service_1.ResumeParserService]
    })
], CandidatesModule);
//# sourceMappingURL=candidates.module.js.map