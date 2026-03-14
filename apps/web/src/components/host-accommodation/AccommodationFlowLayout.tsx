import type { ReactNode } from 'react'
import Logo from '@/components/shared/logo'

interface AccommodationFlowLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  /** [fin segmento 1, fin segmento 2]. Ej: [5, 6] = segmento 1 pasos 0-4, segmento 2 paso 5, segmento 3 el resto. */
  segmentBoundaries?: [number, number]
  onBack: () => void
  onNext: () => void
  canGoNext?: boolean
  nextLabel?: string
}

export function AccommodationFlowLayout({
  children,
  currentStep,
  totalSteps,
  segmentBoundaries,
  onBack,
  onNext,
  canGoNext = true,
  nextLabel = 'Siguiente',
}: AccommodationFlowLayoutProps) {
  const [end1, end2] = segmentBoundaries ?? [totalSteps, totalSteps]
  const segStarts = [0, end1, end2]
  const segEnds = [end1, end2, totalSteps]

  const getSegmentFill = (segmentIndex: number) => {
    const start = segStarts[segmentIndex]
    const end = segEnds[segmentIndex]
    const count = end - start
    if (count <= 0 || currentStep < start) return 0
    if (currentStep >= end) return 100
    return ((currentStep - start + 1) / count) * 100
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="h-9 sm:h-10 px-4 sm:px-5 rounded-full border border-[#DDDDDD] text-sm font-medium text-[#222222] hover:bg-white/80">
            ¿Alguna pregunta?
          </button>
          <button className="h-9 sm:h-10 px-4 sm:px-5 rounded-full border border-[#DDDDDD] text-sm font-medium text-[#222222] hover:bg-white/80">
            Guarda y sal
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 pb-28 sm:pb-32">{children}</main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDDDD]">
        <div className="h-1.5 flex gap-px">
          {/* Segmento 1: hasta datos básicos. Segmento 2: desde "Haz que tu espacio se destaque". Segmento 3: siguiente fase. */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 bg-[#E5E5E5] overflow-hidden">
              <div
                className="h-full bg-black transition-[width] duration-200 ease-out"
                style={{ width: `${getSegmentFill(i)}%` }}
              />
            </div>
          ))}
        </div>

        <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between">
          <button onClick={onBack} className="text-lg sm:text-xl font-medium text-[#222222] hover:underline py-1">
            Atrás
          </button>
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`h-11 sm:h-12 px-6 sm:px-8 rounded-xl text-base font-semibold transition ${
              canGoNext
                ? 'bg-[#222222] text-white hover:opacity-90'
                : 'bg-[#E7E7E7] text-[#B0B0B0] cursor-not-allowed'
            }`}
          >
            {nextLabel}
          </button>
        </div>
      </footer>
    </div>
  )
}
