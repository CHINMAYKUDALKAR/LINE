import { Controller, Get, Patch, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { UpdateSsoDto } from './dto/update-sso.dto';
import { UpdateSmtpDto } from './dto/update-smtp.dto';
import { TestSmtpDto } from './dto/test-smtp.dto';
import { CreateApiKeyDto } from './dto/create-apikey.dto';
import { RevokeApiKeyDto } from './dto/revoke-apikey.dto';
import { UpdateSecurityPolicyDto } from './dto/update-security.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/settings')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SettingsController {
    constructor(private svc: SettingsService) { }

    @Get()
    @Roles('ADMIN', 'MANAGER')
    getSettings(@Req() req: any) {
        return this.svc.getSettings(req.user.tenantId);
    }

    @Patch('branding')
    @Roles('ADMIN')
    updateBranding(@Req() req: any, @Body() dto: UpdateBrandingDto) {
        return this.svc.updateBranding(req.user.tenantId, req.user.sub, dto);
    }

    @Patch('sso')
    @Roles('ADMIN')
    updateSso(@Req() req: any, @Body() dto: UpdateSsoDto) {
        return this.svc.updateSso(req.user.tenantId, req.user.sub, dto);
    }

    @Patch('smtp')
    @Roles('ADMIN')
    updateSmtp(@Req() req: any, @Body() dto: UpdateSmtpDto) {
        return this.svc.updateSmtp(req.user.tenantId, req.user.sub, dto);
    }

    @Post('smtp/test')
    @Roles('ADMIN')
    testSmtp(@Req() req: any, @Body() dto: TestSmtpDto) {
        return this.svc.testSmtp(req.user.tenantId, dto);
    }

    @Post('apikeys')
    @Roles('ADMIN')
    createApiKey(@Req() req: any, @Body() dto: CreateApiKeyDto) {
        return this.svc.createApiKey(req.user.tenantId, req.user.sub, dto);
    }

    @Get('apikeys')
    @Roles('ADMIN')
    listApiKeys(@Req() req: any) {
        return this.svc.listApiKeys(req.user.tenantId);
    }

    @Post('apikeys/revoke')
    @Roles('ADMIN')
    revokeApiKey(@Req() req: any, @Body() dto: RevokeApiKeyDto) {
        return this.svc.revokeApiKey(req.user.tenantId, req.user.sub, dto.id);
    }

    @Get('security')
    @Roles('ADMIN', 'MANAGER')
    getSecurityPolicy(@Req() req: any) {
        return this.svc.getSecurityPolicy(req.user.tenantId);
    }

    @Patch('security')
    @Roles('ADMIN')
    updateSecurityPolicy(@Req() req: any, @Body() dto: UpdateSecurityPolicyDto) {
        return this.svc.updateSecurityPolicy(req.user.tenantId, req.user.sub, dto);
    }
}
