import type { Request } from 'express';
import type { UserRole } from '../prisma-enums';

export interface AuthenticatedUser {
  userId: string;
  organizationId: string | null;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
