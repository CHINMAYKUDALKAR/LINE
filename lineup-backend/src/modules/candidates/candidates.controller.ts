import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ListCandidatesDto } from './dto/list-candidates.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { CreateCandidateNoteDto, UpdateCandidateNoteDto } from './dto/candidate-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RateLimited, RateLimitProfile } from '../../common/rate-limit';

@ApiTags('candidates')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/candidates')
@UseGuards(JwtAuthGuard, RbacGuard)
export class CandidatesController {
    constructor(private svc: CandidatesService) { }

    @Post()
    @RateLimited(RateLimitProfile.WRITE)
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
    @RateLimited(RateLimitProfile.READ)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'List all candidates with pagination and filters' })
    @ApiResponse({ status: 200, description: 'List of candidates' })
    list(@Req() req: any, @Query() dto: ListCandidatesDto) {
        return this.svc.list(req.user.tenantId, dto);
    }

    @Get(':id')
    @RateLimited(RateLimitProfile.READ)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'Get candidate by ID' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiResponse({ status: 200, description: 'Candidate details' })
    @ApiResponse({ status: 404, description: 'Candidate not found' })
    get(@Req() req: any, @Param('id') id: string) {
        return this.svc.get(req.user.tenantId, id);
    }

    @Patch(':id')
    @RateLimited(RateLimitProfile.WRITE)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCandidateDto) {
        return this.svc.update(req.user.tenantId, req.user.sub, id, dto);
    }

    @Delete(':id')
    @RateLimited(RateLimitProfile.WRITE)
    @Roles('ADMIN', 'MANAGER')
    delete(@Req() req: any, @Param('id') id: string) {
        return this.svc.delete(req.user.tenantId, req.user.sub, id);
    }

    @Post(':id/resume/upload-url')
    @RateLimited(RateLimitProfile.WRITE)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    uploadUrl(@Req() req: any, @Param('id') id: string, @Body('filename') filename: string) {
        return this.svc.generateResumeUploadUrl(req.user.tenantId, req.user.sub, id, filename);
    }

    @Post(':id/resume/attach')
    @RateLimited(RateLimitProfile.WRITE)
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
    @RateLimited(RateLimitProfile.BULK)
    @Roles('ADMIN', 'MANAGER')
    bulkImport(@Req() req: any, @Body() body: any) {
        // Check if this is direct row import or URL-based import
        if (body.rows && Array.isArray(body.rows)) {
            return this.svc.directBulkImport(req.user.tenantId, req.user.sub, body.rows);
        }
        // Fall back to URL-based import
        return this.svc.bulkImport(req.user.tenantId, req.user.sub, body);
    }

    // =====================================================
    // CANDIDATE DOCUMENTS
    // =====================================================

    @Get(':id/documents')
    @RateLimited(RateLimitProfile.READ)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'List all documents for a candidate' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiResponse({ status: 200, description: 'List of documents' })
    listDocuments(@Req() req: any, @Param('id') id: string) {
        return this.svc.listDocuments(req.user.tenantId, id);
    }

    // =====================================================
    // CANDIDATE NOTES
    // =====================================================

    @Get(':id/notes')
    @RateLimited(RateLimitProfile.READ)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'List all notes for a candidate' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiResponse({ status: 200, description: 'List of notes with author details' })
    listNotes(@Req() req: any, @Param('id') id: string) {
        return this.svc.listNotes(req.user.tenantId, id);
    }

    @Post(':id/notes')
    @RateLimited(RateLimitProfile.WRITE)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'Add a note to a candidate' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiBody({ type: CreateCandidateNoteDto })
    @ApiResponse({ status: 201, description: 'Note created' })
    addNote(@Req() req: any, @Param('id') id: string, @Body() dto: CreateCandidateNoteDto) {
        return this.svc.addNote(req.user.tenantId, id, req.user.sub, dto.content);
    }

    @Patch(':id/notes/:noteId')
    @RateLimited(RateLimitProfile.WRITE)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'Update a candidate note (author or admin)' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiParam({ name: 'noteId', description: 'Note ID' })
    @ApiBody({ type: UpdateCandidateNoteDto })
    @ApiResponse({ status: 200, description: 'Note updated' })
    updateNote(@Req() req: any, @Param('noteId') noteId: string, @Body() dto: UpdateCandidateNoteDto) {
        return this.svc.updateNote(req.user.tenantId, noteId, req.user.sub, req.user.role, dto.content);
    }

    @Delete(':id/notes/:noteId')
    @RateLimited(RateLimitProfile.WRITE)
    @Roles('ADMIN', 'MANAGER', 'RECRUITER')
    @ApiOperation({ summary: 'Delete a candidate note (author or admin)' })
    @ApiParam({ name: 'id', description: 'Candidate ID' })
    @ApiParam({ name: 'noteId', description: 'Note ID' })
    @ApiResponse({ status: 200, description: 'Note deleted' })
    deleteNote(@Req() req: any, @Param('noteId') noteId: string) {
        return this.svc.deleteNote(req.user.tenantId, noteId, req.user.sub, req.user.role);
    }
}