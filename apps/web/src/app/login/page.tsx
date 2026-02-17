'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
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
      router.push(redirect)
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Error al iniciar sesión'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[400px] mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-secondary mb-6">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-sm text-secondary text-center">
            ¿No tienes cuenta?{' '}
            <Link href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-primary font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-secondary">Cargando...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
