/**
 * Redirección post-login/registro según rol (SaaS multi-tenant).
 * Si el usuario llegó con ?redirect=... se usa eso; si no, según rol.
 */
export type AuthRole = 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN'

const REDIRECT_BY_ROLE: Record<AuthRole, string> = {
  GUEST: '/',
  HOST: '/host',
  ADMIN: '/host',
  SUPER_ADMIN: '/host',
}

export function getRedirectAfterAuth(role: AuthRole, explicitRedirect?: string | null): string {
  if (explicitRedirect && explicitRedirect.trim() !== '' && explicitRedirect !== '/') {
    return explicitRedirect
  }
  return REDIRECT_BY_ROLE[role] ?? '/'
}
