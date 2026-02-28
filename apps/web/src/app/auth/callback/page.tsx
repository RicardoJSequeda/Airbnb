'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getRedirectAfterAuth, type AuthRole } from '@/lib/auth-redirect'
import { parseErrorMessage } from '@/lib/utils/parse-error'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hash = window.location.hash?.slice(1) || ''
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')

    const redirect = searchParams.get('redirect') || '/'

    if (!accessToken) {
      setStatus('error')
      setMessage('No se recibió el token de sesión. Redirigiendo…')
      window.location.href = redirect || '/'
      return
    }

    authApi
      .oauthLogin(accessToken)
      .then(({ user, token }) => {
        setAuth(user, token)
        const target = getRedirectAfterAuth((user.role as AuthRole) ?? 'GUEST', redirect)
        window.location.href = target
      })
      .catch((err) => {
        setStatus('error')
        setMessage(
          parseErrorMessage(
            err,
            'No se pudo conectar con el servidor. Comprueba que la API esté en marcha y que Supabase esté configurado.'
          )
        )
        setTimeout(() => {
          window.location.href = redirect || '/'
        }, 4000)
      })
  }, [searchParams, setAuth])

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-2 border-[#ff385c] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-secondary">Iniciando sesión…</p>
        </>
      )}
      {status === 'error' && <p className="text-secondary text-center">{message}</p>}
    </div>
  )
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6">
      <div className="w-10 h-10 border-2 border-[#ff385c] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-secondary">Iniciando sesión…</p>
    </div>
  )
}

/**
 * Página de callback tras OAuth con Google (Supabase).
 * Lee access_token del hash, lo envía al backend /auth/oauth-login,
 * guarda sesión y redirige con getRedirectAfterAuth(role, redirect).
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
