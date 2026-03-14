/** Extrae mensaje de error de forma segura (axios, Error, etc.) */
export function parseErrorMessage(err: unknown, fallback = 'Ha ocurrido un error'): string {
  if (!err || typeof err !== 'object') return fallback
  const e = err as { response?: { data?: unknown }; message?: string }
  const data = e.response?.data
  if (data && typeof data === 'object' && data !== null && 'message' in data) {
    const msg = (data as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  if (typeof e.message === 'string') return e.message
  return fallback
}

export function parseErrorCode(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null
  const e = err as { response?: { data?: unknown } }
  const data = e.response?.data
  if (!data || typeof data !== 'object') return null
  const code = (data as { errorCode?: unknown }).errorCode
  return typeof code === 'string' ? code : null
}
