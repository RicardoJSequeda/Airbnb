/**
 * Validación de variables de entorno requeridas para producción.
 * Si falta alguna, lanza Error y aborta el inicio.
 */
const REQUIRED_ENV = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'FRONTEND_URL',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  for (const key of REQUIRED_ENV) {
    const value = process.env[key];
    if (!value || String(value).trim() === '') {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in .env or your deployment platform (e.g. Railway).',
    );
  }
}
