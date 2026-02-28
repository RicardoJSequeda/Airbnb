import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../prisma-enums';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_ORGANIZATION_CHECK_KEY } from '../decorators/organization.decorator';

/**
 * Garantiza aislamiento fuerte entre organizaciones:
 * - Usuarios deben tener organizationId (excepto SUPER_ADMIN)
 * - organizationId se resuelve exclusivamente desde req.user (nunca de query/body)
 * - SUPER_ADMIN: organizationId null → acceso global explícito (sin filtrar por org)
 * - Todas las consultas org-scoped usan req.user.organizationId
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipOrgCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_ORGANIZATION_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipOrgCheck) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return true; // Auth guard ya falló o no está aplicado

    if (user.role === UserRole.SUPER_ADMIN) return true;

    if (!user.organizationId) {
      throw new ForbiddenException(
        'User must belong to an organization to access this resource',
      );
    }

    return true;
  }
}
