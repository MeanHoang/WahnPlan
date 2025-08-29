import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
        fullname: 'Test User',
      };

      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
        fullname: registerDto.fullname,
        publicName: 'test',
        avatarUrl: null,
        emailVerify: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      const result = await service.register(registerDto);

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
        fullname: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        fullname: 'Test User',
        publicName: 'test',
        avatarUrl: null,
        emailVerify: true,
        passwordHash: '$2b$12$hashedpassword',
        enable: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      // Mock bcrypt.compare to return true
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
