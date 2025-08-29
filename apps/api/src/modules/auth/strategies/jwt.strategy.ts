import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
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

    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      publicName: user.publicName,
      avatarUrl: user.avatarUrl,
      emailVerify: user.emailVerify,
    };
  }
}
