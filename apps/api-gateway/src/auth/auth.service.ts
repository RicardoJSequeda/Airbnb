import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../common/prisma-enums';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const org = await this.prisma.organization.findUnique({
      where: { slug: 'demo' },
    });
    if (!org) {
      throw new ConflictException('Organization not configured');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.GUEST,
        organizationId: org.id,
      },
    });

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.authProvider === 'supabase') {
      throw new UnauthorizedException('Use Google to sign in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId ?? undefined,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        organizationId: true,
        organization: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      organization: user.organization ?? undefined,
    };
  }

  /**
   * Login/register via Supabase OAuth (Google). Valida el JWT de Supabase (firma,
   * iss, aud, exp), busca o crea usuario (rol GUEST), no asigna contraseña.
   * Optimización futura: manejar refresh_token de Supabase para renovar sesión
   * sin que el usuario vuelva a pasar por Google.
   */
  async oauthLogin(accessToken: string) {
    if (!accessToken || typeof accessToken !== 'string' || !accessToken.trim()) {
      throw new UnauthorizedException('Access token is required');
    }

    const secret =
      this.configService.get<string>('SUPABASE_JWT_SECRET') ||
      this.configService.get<string>('JWT_SECRET');
    if (!secret || secret.trim() === '') {
      this.logger.warn('OAuth login attempted but SUPABASE_JWT_SECRET/JWT_SECRET is not set');
      throw new UnauthorizedException('OAuth not configured');
    }

    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.trim();
      const issuer = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/auth/v1` : undefined;
      const audience = 'authenticated';

      let payload: {
        sub: string;
        email?: string;
        user_metadata?: { name?: string; full_name?: string; email?: string };
      };
      try {
        payload = jwt.verify(accessToken.trim(), secret, {
          algorithms: ['HS256'],
          ...(issuer && { issuer }),
          audience,
          clockTolerance: 10,
        }) as typeof payload;
      } catch (verifyErr) {
        if (issuer) {
          try {
            payload = jwt.verify(accessToken.trim(), secret, {
              algorithms: ['HS256'],
              issuer,
              clockTolerance: 10,
            }) as typeof payload;
          } catch {
            throw new UnauthorizedException('Invalid or expired token');
          }
        } else {
          throw new UnauthorizedException('Invalid or expired token');
        }
      }

      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const email =
        payload.email || payload.user_metadata?.email || `user-${payload.sub}@placeholder.local`;
      const name =
        payload.user_metadata?.full_name ||
        payload.user_metadata?.name ||
        email.split('@')[0] ||
        'Usuario';

      const demoOrg = await this.prisma.organization.findUnique({
        where: { slug: 'demo' },
      });

      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: payload.sub }, { supabaseId: payload.sub }],
        },
      });

      if (!user) {
        if (!demoOrg) {
          this.logger.warn('OAuth login: organization "demo" not found. Create it or run seed.');
          throw new ConflictException('Organization not configured. Please contact support.');
        }
        user = await this.prisma.user.create({
          data: {
            id: payload.sub,
            supabaseId: payload.sub,
            email,
            name,
            authProvider: 'supabase',
            role: UserRole.GUEST,
            organizationId: demoOrg.id,
          },
        });
      } else if (!user.supabaseId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { supabaseId: payload.sub, authProvider: 'supabase' },
        });
      }

      const tokenPayload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(tokenPayload);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId ?? undefined,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException || err instanceof ConflictException) {
        throw err;
      }
      const prismaErr = err as { code?: string; message?: string };
      if (prismaErr?.code && typeof prismaErr.code === 'string') {
        this.logger.error(`OAuth login Prisma error: ${prismaErr.code} - ${prismaErr.message}`);
        throw new ServiceUnavailableException(
          'Database temporarily unavailable. Please try again in a moment.',
        );
      }
      this.logger.error('OAuth login unexpected error', err instanceof Error ? err.stack : err);
      throw new ServiceUnavailableException(
        'Authentication service temporarily unavailable. Please try again.',
      );
    }
  }
}
