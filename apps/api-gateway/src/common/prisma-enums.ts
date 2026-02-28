/**
 * Enums que coinciden con el schema de Prisma (packages/database).
 * Se usan cuando el cliente generado no exporta estos tipos en el contexto del api-gateway.
 */

export const UserRole = {
  GUEST: 'GUEST',
  HOST: 'HOST',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
