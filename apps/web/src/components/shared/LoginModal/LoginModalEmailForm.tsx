'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'

const BUTTON_CLASS =
  'w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c13584] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff385c] disabled:opacity-50'

type LoginModalEmailFormProps = {
  redirect: string
  onSuccess: () => void
  onBack: () => void
}

export function LoginModalEmailForm({
  redirect,
  onSuccess,
  onBack,
}: LoginModalEmailFormProps) {
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { user, token } = await authApi.login({ email, password })
      setAuth(user, token)
      onSuccess()
      window.location.href = redirect
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Error al iniciar sesión'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-secondary hover:underline mb-2"
      >
        ← Volver
      </button>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-secondary mb-1.5">
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
            placeholder="Correo electrónico"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-secondary mb-1.5">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
            placeholder="Contraseña"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button type="submit" disabled={loading} className={BUTTON_CLASS}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="text-sm text-secondary text-center">
        ¿No tienes cuenta?{' '}
        <Link
          href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-[#0066cc] font-medium hover:underline"
          onClick={onSuccess}
        >
          Regístrate
        </Link>
      </p>
    </div>
  )
}
