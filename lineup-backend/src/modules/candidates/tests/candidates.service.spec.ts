import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from '../candidates.service';
import { PrismaService } from '../../../common/prisma.service';
import { S3Service } from '../../../common/s3.service';
import { Queue } from 'bullmq';

const mockPrismaService = {
    candidate: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
};

const mockS3Service = {
    getPresignedUploadUrl: jest.fn(),
};

const mockQueue = {
    add: jest.fn(),
};

describe('CandidatesService', () => {
    let service: CandidatesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CandidatesService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: S3Service, useValue: mockS3Service },
                { provide: 'BullQueue_candidate-import', useValue: mockQueue },
            ],
        }).compile();

        service = module.get<CandidatesService>(CandidatesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create candidate', async () => {
        const dto = { name: 'Alice', email: 'alice@example.com' };
        (mockPrismaService.candidate.findFirst as jest.Mock).mockResolvedValue(null);
        (mockPrismaService.candidate.create as jest.Mock).mockResolvedValue({ id: '1', ...dto });

        const result = await service.create('t1', 'u1', dto);
        expect(result).toHaveProperty('id');
        expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it('should generate resume url', async () => {
        (mockPrismaService.candidate.findUnique as jest.Mock).mockResolvedValue({ id: '1', tenantId: 't1' });
        (mockS3Service.getPresignedUploadUrl as jest.Mock).mockResolvedValue('https://s3.amazonaws.com/bucket/key?sig=123');

        const result = await service.generateResumeUploadUrl('t1', 'u1', '1', 'resume.pdf');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('key');
    });
});
