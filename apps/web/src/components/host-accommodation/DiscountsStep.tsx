'use client'

import Link from 'next/link'

const DISCOUNT_OPTIONS = [
  {
    id: 'newPromo',
    percent: '20%',
    title: 'Nueva promoción del anuncio',
    description: 'Ofrece un 20 % de descuento en tus primeras 3 reservaciones.',
  },
  {
    id: 'lastMinute',
    percent: '11%',
    title: 'Descuento de último minuto',
    description: 'Para las estadías reservadas con 4 días de anticipación o menos.',
  },
  {
    id: 'weekly',
    percent: '15%',
    title: 'Descuento semanal',
    description: 'Para estadías de 7 noches o más.',
  },
  {
    id: 'monthly',
    percent: '33%',
    title: 'Descuento mensual',
    description: 'Para estadías de 28 noches o más.',
  },
] as const

interface DiscountsStepProps {
  selected: string[]
  onChange: (next: string[]) => void
}

export function DiscountsStep({ selected, onChange }: DiscountsStepProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-2">
        Agrega los descuentos
      </h2>
      <p className="text-sm text-[#717171] mb-6 max-w-[520px]">
        Destaca tu alojamiento para conseguir reservaciones más rápido y obtener tus primeras
        reseñas.
      </p>

      <div className="space-y-3">
        {DISCOUNT_OPTIONS.map((opt) => {
          const isActive = selected.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`w-full flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                isActive
                  ? 'border-[#222222] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                  : 'border-[#DDDDDD] bg-white hover:border-[#B0B0B0]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-base font-semibold text-[#222222]">
                  {opt.percent}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#222222] mb-1">{opt.title}</p>
                  <p className="text-xs text-[#717171]">{opt.description}</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded border flex items-center justify-center ${
                  isActive ? 'bg-[#222222] border-[#222222]' : 'border-[#DDDDDD]'
                }`}
              >
                {isActive ? (
                  <span className="block w-3 h-3 bg-white rounded-sm" />
                ) : (
                  <span className="block w-3 h-3 rounded-sm bg-transparent" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-4 text-[11px] text-[#B0B0B0]">
        Solo se aplicará un descuento por estadía.{' '}
        <Link href="#" className="underline text-[#717171]">
          Más información
        </Link>
      </p>
    </section>
  )
}

