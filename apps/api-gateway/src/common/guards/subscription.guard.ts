import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Garantiza que la organización del usuario tenga una suscripción ACTIVE.
 * Resuelve organizationId exclusivamente desde req.user (no query params).
 *
 * - Rutas @Public(): permitido.
 * - SUPER_ADMIN: permitido (sin org).
 * - Sin organizationId: permitido (OrganizationGuard lo rechazará antes).
 * - subscription.status !== ACTIVE: 403 con SUBSCRIPTION_INACTIVE.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return true;

    if (user.role === UserRole.SUPER_ADMIN) return true;

    const organizationId = user.organizationId;
    if (!organizationId) return true;

    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new ForbiddenException({
        message: 'Organization has no subscription',
        errorCode: 'SUBSCRIPTION_INACTIVE',
      });
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException({
        message: 'Subscription is not active',
        errorCode: 'SUBSCRIPTION_INACTIVE',
      });
    }

    return true;
  }
}
