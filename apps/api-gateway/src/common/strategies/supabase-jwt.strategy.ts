import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';

import { UserRole } from '../prisma-enums';

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(
  Strategy,
  'supabase-jwt',
) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret =
      configService.get<string>('SUPABASE_JWT_SECRET') ||
      configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'SUPABASE_JWT_SECRET or JWT_SECRET is required for authentication',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
    user_metadata?: { name?: string; full_name?: string; email?: string };
  }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const email = payload.email || payload.user_metadata?.email;
    const name =
      payload.user_metadata?.full_name ||
      payload.user_metadata?.name ||
      email?.split('@')[0] ||
      'Usuario';

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: payload.sub }, { supabaseId: payload.sub }],
      },
    });

    if (!user) {
      const demoOrg = await this.prisma.organization.findUnique({
        where: { slug: 'demo' },
      });
      user = await this.prisma.user.create({
        data: {
          id: payload.sub,
          supabaseId: payload.sub,
          email: email || `user-${payload.sub}@placeholder.local`,
          name,
          authProvider: 'supabase',
          role: UserRole.GUEST,
          organizationId: demoOrg?.id,
        },
      });
    } else if (!user.supabaseId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: payload.sub, authProvider: 'supabase' },
      });
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  }
}
