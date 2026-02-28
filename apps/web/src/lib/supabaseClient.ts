import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Cliente Supabase solo para OAuth (Google). Se usa en el navegador para
 * signInWithOAuth; el callback envía el access_token al backend y usamos
 * nuestro JWT para el resto de la app.
 */
export function getSupabaseClient() {
  const url = env.supabaseUrl
  const anonKey = env.supabaseAnonKey
  if (!url || !anonKey) {
    return null
  }
  return createClient(url, anonKey)
}
