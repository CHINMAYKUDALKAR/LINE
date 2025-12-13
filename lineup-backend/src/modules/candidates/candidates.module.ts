import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { CandidateImportProcessor } from './processors/candidate-import.processor';
import { PrismaService } from '../../common/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';
import { StorageModule } from '../storage/storage.module';
import { BullModule } from '@nestjs/bullmq';
import { RecycleBinModule } from '../recycle-bin/recycle-bin.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'candidate-import',
    }),
    RecycleBinModule,
    EmailModule,
    StorageModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService, PrismaService, CandidateImportProcessor],
  exports: [CandidatesService]
})
export class CandidatesModule { }