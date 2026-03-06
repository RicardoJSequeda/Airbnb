import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    /* passport-jwt: ExtractJwt/super options not fully inferred by TS; API is typed in @types/passport-jwt */
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  async validate(payload: { sub: string; email?: string; jti?: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Si el token tiene jti (nuestro JWT de login/register), validar sesión en BD
    if (payload.jti) {
      const session = await this.prisma.session.findUnique({
        where: { jti: payload.jti },
      });
      if (
        !session ||
        session.expiresAt < new Date() ||
        session.userId !== payload.sub
      ) {
        throw new UnauthorizedException('Session expired or invalid');
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, organizationId: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      ...(payload.jti && { jti: payload.jti }),
    };
  }
}
