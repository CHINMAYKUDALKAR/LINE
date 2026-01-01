import { Module } from '@nestjs/common';
import { RecycleBinService } from './recycle-bin.service';
import { RecycleBinController } from './recycle-bin.controller';
import { AppCommonModule } from '../../common/app-common.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AppCommonModule, AuthModule],
    controllers: [RecycleBinController],
    providers: [RecycleBinService],
    exports: [RecycleBinService],
})
export class RecycleBinModule { }

