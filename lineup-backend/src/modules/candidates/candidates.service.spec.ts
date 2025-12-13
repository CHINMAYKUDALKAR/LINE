import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { PrismaService } from '../../common/prisma.service';
import { CandidatesQueue } from './candidates.queue';

describe('CandidatesService', () => {
    let service: CandidatesService;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CandidatesService,
                {
                    provide: PrismaService,
                    useValue: {
                        candidate: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        auditLog: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: CandidatesQueue,
                    useValue: {
                        getQueue: jest.fn().mockReturnValue({
                            add: jest.fn(),
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get(CandidatesService);
        prisma = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // Add more tests as needed
});
