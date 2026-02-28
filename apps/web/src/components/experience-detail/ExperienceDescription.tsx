'use client'

import { Languages } from 'lucide-react'

interface ExperienceDescriptionProps {
  description: string
  languages?: string[]
  /** Número de registro RNT (ej. "41491") */
  registrationNumber?: string
}

/** Descripción principal + RNT + "Se tradujo automáticamente" (referencia Airbnb). */
export default function ExperienceDescription({
  description,
  languages = [],
  registrationNumber,
}: ExperienceDescriptionProps) {
  // Si no hay descripción, no renderizar nada
  if (!description || !description.trim()) {
    return null
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Descripción principal */}
      <p className="text-sm text-neutral-700 leading-tight whitespace-pre-line">
        {description}
      </p>
      {/* RNT debajo de la descripción */}
      {registrationNumber && (
        <p className="text-sm text-neutral-500 text-center leading-tight">
          RNT: {registrationNumber}
        </p>
      )}
      {/* "Se tradujo automáticamente": centrado, con espaciado respecto al RNT */}
      <p className="text-xs text-neutral-500 flex items-center justify-center gap-1.5 leading-tight mt-1.5">
        <Languages className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>Se tradujo automáticamente</span>
      </p>
    </div>
  )
}
