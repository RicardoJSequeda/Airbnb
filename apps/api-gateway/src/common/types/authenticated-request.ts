import type { Request } from 'express';
import type { UserRole } from '../prisma-enums';

export interface AuthenticatedUser {
  userId: string;
  organizationId: string | null;
  role: UserRole;
  /** Present when the token is our own JWT (login/register); used for logout. */
  jti?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
