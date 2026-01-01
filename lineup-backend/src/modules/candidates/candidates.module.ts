import { Module, forwardRef } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { CandidateImportProcessor } from './processors/candidate-import.processor';
import { StageTransitionService } from './services/stage-transition.service';
import { ResumeParserService } from './services/resume-parser.service';
import { PrismaService } from '../../common/prisma.service';
import { S3Service } from '../../common/s3.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';
import { StorageModule } from '../storage/storage.module';
import { BullModule } from '@nestjs/bullmq';
import { RecycleBinModule } from '../recycle-bin/recycle-bin.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CandidatePortalModule } from '../candidate-portal/candidate-portal.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'candidate-import',
    }),
    RecycleBinModule,
    EmailModule,
    StorageModule,
    IntegrationsModule,
    forwardRef(() => CandidatePortalModule),
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, StageTransitionService, ResumeParserService, PrismaService, S3Service, CandidateImportProcessor],
  exports: [CandidatesService, StageTransitionService, ResumeParserService]
})
export class CandidatesModule { }