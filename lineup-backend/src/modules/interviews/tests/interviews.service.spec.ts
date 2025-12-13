import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from '../interviews.service';
import { PrismaService } from '../../../common/prisma.service';
import { Queue } from 'bullmq';

const mockPrismaService = {
    candidate: { findUnique: jest.fn() },
    user: { findMany: jest.fn() },
    interview: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
    },
    auditLog: { create: jest.fn() },
};

const mockQueue = { add: jest.fn() };

describe('InterviewsService', () => {
    let service: InterviewsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterviewsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: 'BullQueue_interview-reminder', useValue: mockQueue },
                { provide: 'BullQueue_calendar-sync', useValue: mockQueue },
            ],
        }).compile();

        service = module.get<InterviewsService>(InterviewsService);
    });

    afterEach(() => { jest.clearAllMocks(); });

    it('should create interview if no conflict', async () => {
        const dto = {
            candidateId: 'c1',
            interviewerIds: ['u1'],
            startAt: new Date().toISOString(),
            durationMins: 30
        };
        (mockPrismaService.candidate.findUnique as jest.Mock).mockResolvedValue({ id: 'c1', tenantId: 't1' });
        (mockPrismaService.user.findMany as jest.Mock).mockResolvedValue([{ id: 'u1', tenantId: 't1' }]);
        (mockPrismaService.interview.findMany as jest.Mock).mockResolvedValue([]); // No conflicts
        (mockPrismaService.interview.create as jest.Mock).mockResolvedValue({ id: 'i1', ...dto });

        const result = await service.create('t1', 'u1', dto);
        expect(result).toHaveProperty('id', 'i1');
    });

    it('should throw conflict if overlap', async () => {
        const dto = {
            candidateId: 'c1',
            interviewerIds: ['u1'],
            startAt: '2025-01-01T10:00:00Z',
            durationMins: 60
        };
        const start = new Date(dto.startAt);
        // Existing interview 10:30-11:30 (overlaps 10:00-11:00)
        const overlapping = {
            id: 'i2',
            date: new Date('2025-01-01T10:30:00Z'),
            durationMins: 60
        };

        (mockPrismaService.candidate.findUnique as jest.Mock).mockResolvedValue({ id: 'c1', tenantId: 't1' });
        (mockPrismaService.user.findMany as jest.Mock).mockResolvedValue([{ id: 'u1', tenantId: 't1' }]);
        (mockPrismaService.interview.findMany as jest.Mock).mockResolvedValue([overlapping]);

        await expect(service.create('t1', 'u1', dto)).rejects.toThrow();
    });
});
