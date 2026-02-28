'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRegisterModalStore } from '@/lib/stores/register-modal-store'

function RegisterRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const openRegisterModal = useRegisterModalStore((s) => s.open)

  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/'
    openRegisterModal(redirect)
    router.replace('/')
  }, [openRegisterModal, router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-secondary">Redirigiendo al registro...</p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-secondary">Cargando...</p>
        </div>
      }
    >
      <RegisterRedirect />
    </Suspense>
  )
}
