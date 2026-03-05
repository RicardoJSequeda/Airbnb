import type { ReactNode } from 'react'
import Logo from '@/components/shared/logo'

interface AccommodationFlowLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  canGoNext?: boolean
}

export function AccommodationFlowLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  canGoNext = true,
}: AccommodationFlowLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <header className="h-24 px-10 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <button className="h-14 px-8 rounded-full border border-[#DDDDDD] text-xl font-medium text-[#222222]">
            ¿Alguna pregunta?
          </button>
          <button className="h-14 px-8 rounded-full border border-[#DDDDDD] text-xl font-medium text-[#222222]">
            Guarda y sal
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 pb-36">{children}</main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD]">
        <div className="h-2 flex">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={index}
                className={`flex-1 ${index !== totalSteps - 1 ? 'mr-1' : ''} ${
                  isCompleted || isCurrent ? 'bg-black' : 'bg-[#E5E5E5]'
                }`}
              />
            )
          })}
        </div>

        <div className="h-24 px-10 flex items-center justify-between">
          <button onClick={onBack} className="text-4xl font-medium text-[#222222] hover:underline">
            Atrás
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`h-16 px-12 rounded-2xl text-2xl font-semibold transition ${
              canGoNext
                ? 'bg-[#222222] text-white hover:opacity-90'
                : 'bg-[#E7E7E7] text-[#B0B0B0] cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        </div>
      </footer>
    </div>
  )
}
