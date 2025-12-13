import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from '../../../src/modules/interviews/interviews.service';
import { PrismaService } from '../../../src/common/prisma.service';
import { InterviewsQueue } from '../../../src/modules/interviews/interviews.queue';

describe('InterviewsService', () => {
    let service: InterviewsService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InterviewsService,
                {
                    provide: PrismaService,
                    useValue: {
                        interview: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        candidate: {
                            findUnique: jest.fn(),
                        },
                        auditLog: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: InterviewsQueue,
                    useValue: {
                        getQueue: jest.fn().mockReturnValue({
                            add: jest.fn(),
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get(InterviewsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // Add more tests as needed
});
