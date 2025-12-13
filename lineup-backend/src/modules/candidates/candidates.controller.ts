import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('candidates')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/candidates')
@UseGuards(JwtAuthGuard, RbacGuard)
export class CandidatesController {
    constructor(private svc: CandidatesService) { }

    @Post()
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'Create a new candidate' })
    @ApiResponse({ status: 201, description: 'Candidate created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBody({ type: CreateCandidateDto })
    create(@Req() req: any, @Body() dto: CreateCandidateDto) {
        return this.svc.create(req.user.tenantId, req.user.sub, dto);
    }

    @Get()
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'List all candidates with pagination and filters' })
    @ApiResponse({ status: 200, description: 'List of candidates' })
    list(@Req() req: any, @Query() dto: ListCandidatesDto) {
        return this.svc.list(req.user.tenantId, dto);
    }

    @Get(':id')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'Get candidate by ID' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiResponse({ status: 200, description: 'Candidate details' })
    @ApiResponse({ status: 404, description: 'Candidate not found' })
    get(@Req() req: any, @Param('id') id: string) {
        return this.svc.get(req.user.tenantId, id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCandidateDto) {
        return this.svc.update(req.user.tenantId, req.user.sub, id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'MANAGER')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.svc.delete(req.user.tenantId, req.user.sub, id);
    }

    @Post(':id/resume/upload-url')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    uploadUrl(@Req() req: any, @Param('id') id: string, @Body('filename') filename: string) {
        return this.svc.generateResumeUploadUrl(req.user.tenantId, req.user.sub, id, filename);
    }

    @Post(':id/resume/attach')
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    attachResume(
        @Req() req: any,
        @Param('id') id: string,
        @Body('fileId') fileId: string,
        @Body('s3Key') s3Key: string,
        @Body('mimeType') mimeType?: string,
        @Body('size') size?: number
    ) {
        return this.svc.attachResume(req.user.tenantId, req.user.sub, id, fileId, s3Key, mimeType, size);
    }

    @Post('bulk-import')
    @Roles('ADMIN', 'MANAGER')
    bulkImport(@Req() req: any, @Body() body: any) {
        // Check if this is direct row import or URL-based import
        if (body.rows && Array.isArray(body.rows)) {
            return this.svc.directBulkImport(req.user.tenantId, req.user.sub, body.rows);
        }
        // Fall back to URL-based import
        return this.svc.bulkImport(req.user.tenantId, req.user.sub, body);
    }
}