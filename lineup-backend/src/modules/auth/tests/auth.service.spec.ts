import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../common/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock dependencies
const mockPrismaService = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
    },
};

jest.mock('bcrypt');
jest.mock('../utils/token.util', () => ({
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
}));

import * as TokenUtil from '../utils/token.util';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user and return tokens', async () => {
            const dto = { email: 'test@example.com', password: 'password', name: 'Test User' };
            const hashedPassword = 'hashedPassword';
            const user = { id: '1', ...dto, password: hashedPassword, role: 'RECRUITER' };

            (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword as never);
            (mockPrismaService.user.create as jest.Mock).mockResolvedValue(user);
            (TokenUtil.signAccessToken as jest.Mock).mockReturnValue('access_token');
            (TokenUtil.signRefreshToken as jest.Mock).mockReturnValue('refresh_token');

            const result = await service.register(dto);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, expect.any(Number));
            expect(mockPrismaService.user.create).toHaveBeenCalled();
            expect(result).toEqual({ id: '1', email: dto.email, name: dto.name });
        });

        it('should throw ConflictException if email exists', async () => {
            const dto = { email: 'test@example.com', password: 'password', name: 'Test User' };
            (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: dto.email });

            await expect(service.register(dto)).rejects.toThrow();
        });
    });

    describe('login', () => {
        it('should login and return tokens for valid credentials', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            const user = { id: '1', email: dto.email, password: 'hashedPassword', name: 'Test User', role: 'RECRUITER' };

            (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
            (TokenUtil.signAccessToken as jest.Mock).mockReturnValue('access_token');
            (TokenUtil.signRefreshToken as jest.Mock).mockReturnValue('refresh_token');

            const result = await service.login(dto.email, dto.password);

            expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
            expect(result).toHaveProperty('accessToken');
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.login(dto.email, dto.password)).rejects.toThrow();
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            const dto = { email: 'test@example.com', password: 'password' };
            const user = { id: '1', email: dto.email, password: 'hashed(Password', role: 'RECRUITER' };
            (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

            await expect(service.login(dto.email, dto.password)).rejects.toThrow();
        });
    });
});
