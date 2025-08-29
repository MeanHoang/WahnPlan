import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { EmailService } from '../../shared/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmailVerificationResponseDto } from './dto/email-verification.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    console.log('Starting registration for email:', registerDto.email);

    const {
      email,
      password,
      fullname,
      publicName,
      jobTitle,
      organization,
      location,
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullname,
        publicName: publicName || fullname.split(' ')[0].toLowerCase(),
        jobTitle,
        organization,
        location,
        emailVerify: false, // Will be verified via email
        language: 'en',
        timezone: 'UTC',
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        avatarUrl: true,
        emailVerify: true,
      },
    });

    // Generate verification token and send email
    try {
      const verificationToken = await this.generateEmailVerificationToken(
        user.id,
      );
      console.log('Generated verification token for user:', user.id);

      await this.emailService.sendVerificationEmail(email, verificationToken);
      console.log('Verification email sent successfully to:', email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullname: true,
        publicName: true,
        avatarUrl: true,
        emailVerify: true,
        passwordHash: true,
        enable: true,
      },
    });

    if (!user || !user.enable) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullname: true,
          publicName: true,
          avatarUrl: true,
          emailVerify: true,
          enable: true,
        },
      });

      if (!user || !user.enable) {
        throw new UnauthorizedException('User not found or disabled');
      }

      const tokens = await this.generateTokens(user.id);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmail(token: string): Promise<EmailVerificationResponseDto> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_EMAIL_VERIFICATION_SECRET'),
      });

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { emailVerify: true },
      });

      return { message: 'Email verified successfully', verified: true };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerify: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerify) {
      throw new BadRequestException('Email already verified');
    }

    // Generate and send verification token
    const verificationToken = await this.generateEmailVerificationToken(
      user.id,
    );
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return { message: 'Verification email sent successfully' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '30d',
        ),
      }),
    ]);

    const expiresIn = this.configService.get<number>(
      'JWT_EXPIRES_IN_SECONDS',
      604800,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const payload = { sub: userId };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_EMAIL_VERIFICATION_SECRET'),
      expiresIn: '24h',
    });
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
