/**
 * Variables de entorno del frontend.
 * NEXT_PUBLIC_* están disponibles en cliente y servidor.
 */

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;

// En desarrollo en localhost: usar siempre /api para que Next haga proxy al api-gateway (evita CORS y 404 por puerto equivocado)
const isDevLocalhost =
  typeof window !== 'undefined' &&
  typeof window.location?.origin === 'string' &&
  (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1'));

const API_URL =
  isDevLocalhost && RAW_API_URL?.includes('localhost')
    ? '/api'
    : RAW_API_URL || '/api';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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
} as const;
