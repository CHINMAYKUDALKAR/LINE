import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { InvitationService } from './invitation.service';
import { PasswordResetService } from './password-reset.service';
import { PrismaService } from '../../common/prisma.service';
import { EmailModule } from '../email/email.module';
import { BruteForceService } from '../../common/brute-force.guard';
import { PasswordPolicyService } from '../../common/password-policy.service';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    InvitationService,
    PasswordResetService,
    PrismaService,
    BruteForceService,
    PasswordPolicyService,
  ],
  exports: [AuthService, InvitationService, BruteForceService, PasswordPolicyService],
})
export class AuthModule { }