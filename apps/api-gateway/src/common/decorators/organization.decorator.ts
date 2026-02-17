import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const SKIP_ORGANIZATION_CHECK_KEY = 'skipOrganizationCheck';

/** Rutas que no requieren validación de organización (ej: SUPER_ADMIN, system) */
export const SkipOrganizationCheck = () =>
  SetMetadata(SKIP_ORGANIZATION_CHECK_KEY, true);

/** Extrae organizationId del usuario autenticado (null para SUPER_ADMIN) */
export const OrganizationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return user?.organizationId ?? null;
  },
);
