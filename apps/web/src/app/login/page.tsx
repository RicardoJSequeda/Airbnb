'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'

function LoginRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const openLoginModal = useLoginModalStore((s) => s.open)

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/'
    openLoginModal(redirect)
    router.replace('/')
  }, [openLoginModal, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-secondary">Redirigiendo al inicio de sesión...</p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-secondary">Cargando...</p>
        </div>
      }
    >
      <LoginRedirect />
    </Suspense>
  )
}
