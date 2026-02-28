/**
 * Variables de entorno del frontend.
 * NEXT_PUBLIC_* están disponibles en cliente y servidor.
 *
 * API (login, reservas, etc.):
 * - Cliente en localhost: usa baseURL '/api' y Next hace proxy a api-gateway (evita CORS).
 * - Servidor (SSR) y producción: usa NEXT_PUBLIC_API_URL (debe ser URL absoluta, ej. https://api.ejemplo.com/api).
 */
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

const isBrowserOnLocalhost =
  typeof window !== 'undefined' &&
  typeof window.location?.origin === 'string' &&
  (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'));

const API_URL =
  isBrowserOnLocalhost && RAW_API_URL?.includes('localhost')
    ? '/api'
    : RAW_API_URL || '/api';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/** URL base del sitio (para OAuth redirect). En cliente puede ser window.location.origin. */
const SITE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL?.trim() || '');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  if (!RAW_API_URL || RAW_API_URL.trim() === '') {
    throw new Error(
      'NEXT_PUBLIC_API_URL is required for production. Set it in Vercel environment variables.',
    );
  }
}

export const env = {
  apiUrl: API_URL,
  stripePublishableKey: STRIPE_PUBLISHABLE_KEY || '',
  siteUrl: SITE_URL,
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
} as const;
