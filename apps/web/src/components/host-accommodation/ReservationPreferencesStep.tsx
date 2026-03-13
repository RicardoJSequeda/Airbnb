'use client'

import Link from 'next/link'
import { CalendarDays, Zap } from 'lucide-react'

type Preference = 'approveFirst5' | 'instant'

interface ReservationPreferencesStepProps {
  value: Preference | null
  onChange: (value: Preference) => void
}

export function ReservationPreferencesStep({
  value,
  onChange,
}: ReservationPreferencesStepProps) {
  const isSelected = (pref: Preference) => value === pref

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-2">
        Elige tus preferencias en las reservaciones
      </h2>
      <p className="text-sm text-[#717171] mb-4">
        Puedes modificar esto en cualquier momento.{' '}
        <Link href="#" className="underline font-medium text-[#222222]">
          Más información
        </Link>
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onChange('approveFirst5')}
          className={`w-full text-left rounded-2xl border px-5 py-4 flex items-start justify-between gap-4 transition ${
            isSelected('approveFirst5')
              ? 'border-[#222222] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
              : 'border-[#DDDDDD] bg-white hover:border-[#B0B0B0]'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-[#222222] mb-0.5">
              Aprobar tus primeras 5 reservaciones
            </p>
            <p className="text-xs font-semibold text-[#008489] mb-1">Recomendado</p>
            <p className="text-sm text-[#717171] max-w-[420px]">
              Para empezar, revisa las solicitudes de reservación y luego cambia a Reservación inmediata
              para que los huéspedes puedan reservar automáticamente.
            </p>
          </div>
          <CalendarDays className="w-6 h-6 text-[#717171] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onChange('instant')}
          className={`w-full text-left rounded-2xl border px-5 py-4 flex items-start justify-between gap-4 transition ${
            isSelected('instant')
              ? 'border-[#222222] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
              : 'border-[#DDDDDD] bg-white hover:border-[#B0B0B0]'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-[#222222] mb-1">
              Usa la Reservación inmediata
            </p>
            <p className="text-sm text-[#717171] max-w-[420px]">
              Deja que los huéspedes hagan reservaciones automáticas.
            </p>
          </div>
          <Zap className="w-6 h-6 text-[#717171] shrink-0" />
        </button>
      </div>
    </section>
  )
}

