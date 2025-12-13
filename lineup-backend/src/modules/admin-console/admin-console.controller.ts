import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { AdminConsoleService } from './admin-console.service';
import { PlatformRbacGuard } from './guards/platform-rbac.guard';
import { AuthGuard } from '../../common/auth.guard';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { CreateTenantProvisionDto } from './dto/create-tenant-provision.dto';
import { Roles } from '../../common/roles.decorator';

@Controller('api/v1/admin')
@UseGuards(AuthGuard, PlatformRbacGuard)
export class AdminConsoleController {
    constructor(private svc: AdminConsoleService) { }

    @Post('platform-users')
    createPlatformUser(@Req() req: any, @Body() dto: CreatePlatformUserDto) {
        return this.svc.createPlatformUser(dto, req.user.sub);
    }

    @Post('provision-tenant')
    @Roles('SUPERADMIN')
    provisionTenant(@Req() req: any, @Body() dto: CreateTenantProvisionDto) {
        return this.svc.provisionTenant(dto, req.user.sub);
    }

    @Get('tenants')
    listTenants() {
        return this.svc.listTenants();
    }

    @Get('tenants/:id/status')
    tenantStatus(@Param('id') id: string) {
        return this.svc.tenantStatus(id);
    }

    @Post('tenants/:id/create-admin')
    createTenantAdmin(@Param('id') id: string, @Body('email') email: string) {
        return this.svc.createTenantAdmin(id, email);
    }
}
