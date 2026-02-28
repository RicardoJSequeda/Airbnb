'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/shared/logo'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  HOST_ONBOARDING_CONTENT,
  DEFAULT_ONBOARDING_TYPE,
  type OnboardingStep,
} from '@/lib/host-onboarding/config'
import type { ShareHostOption } from '@/components/shared/ShareHostModal'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const type = (searchParams.get('type') as ShareHostOption) || DEFAULT_ONBOARDING_TYPE
  const content = HOST_ONBOARDING_CONTENT[type] ?? HOST_ONBOARDING_CONTENT[DEFAULT_ONBOARDING_TYPE]

  useEffect(() => {
    if (!isAuthenticated) {
      const current = `/host/onboarding?type=${type}`
      router.replace(`/login?redirect=${encodeURIComponent(current)}`)
    }
  }, [isAuthenticated, router, type])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-secondary">Redirigiendo al inicio de sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header: logo izquierda, Sal derecha */}
      <header className="flex-shrink-0 flex items-center justify-between w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 h-20 border-b border-gray-200">
        <Logo />
        <Link
          href="/"
          className="text-sm font-medium text-secondary px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          Sal
        </Link>
      </header>

      {/* Main: dos columnas */}
      <main className="flex-1 flex flex-col lg:flex-row lg:items-center w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12 lg:py-16 gap-12 lg:gap-16">
        {/* Columna izquierda: título grande */}
        <div className="flex-1 flex items-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-secondary leading-tight max-w-[480px]">
            {content.mainTitle}
          </h1>
        </div>

        {/* Columna derecha: 3 pasos */}
        <div className="flex-1 max-w-[560px] space-y-10">
          {content.steps.map((step) => (
            <OnboardingStepBlock key={step.number} step={step} />
          ))}
        </div>
      </main>

      {/* Botón Comencemos: fijo abajo derecha, gradiente */}
      <div className="flex-shrink-0 fixed bottom-0 right-0 p-6 md:p-8">
        <button
          type="button"
          onClick={() => {
            // Próximo paso: flujo de creación (por ahora volver o ir a placeholder)
            router.push(`/host/${type}`)
          }}
          className="px-8 py-4 rounded-lg font-semibold text-white text-base shadow-lg transition-opacity hover:opacity-95 bg-gradient-to-r from-[#E61E4D] to-[#FF385C]"
        >
          Comencemos
        </button>
      </div>
    </div>
  )
}

function OnboardingStepBlock({ step }: { step: OnboardingStep }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = step.imageSrc && !imgFailed

  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
        {showImage ? (
          <img
            src={step.imageSrc}
            alt=""
            width={112}
            height={112}
            className="object-contain w-full h-full"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="text-3xl font-bold text-gray-300">{step.number}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold text-secondary mb-2">
          {step.number} {step.title}
        </h2>
        <p className="text-[15px] text-tertiary leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  )
}

export default function HostOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <p className="text-secondary">Cargando...</p>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}
