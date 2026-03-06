'use client'

import {
  outstandingAmenityOptions,
  preferredAmenityOptions,
  securityElementOptions,
} from './data'
import type { AmenityOption } from './types'

interface AmenitiesStepProps {
  selectedIds: string[]
  onToggle: (id: string) => void
  outstandingIds: string[]
  onToggleOutstanding: (id: string) => void
  securityIds: string[]
  onToggleSecurity: (id: string) => void
}

function AmenityCard({
  option,
  isSelected,
  onToggle,
}: {
  option: AmenityOption
  isSelected: boolean
  onToggle: () => void
}) {
  const Icon = option.icon
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border bg-white text-center transition min-h-[100px] px-4 py-4 ${
        isSelected
          ? 'border-[#222222] shadow-[0_0_0_2px_#222222]'
          : 'border-[#DDDDDD] hover:border-[#B0B0B0]'
      }`}
    >
      <Icon className="w-8 h-8 text-[#222222] flex-shrink-0" strokeWidth={1.8} />
      <span className="text-sm font-medium text-[#222222] leading-tight">
        {option.label}
      </span>
    </button>
  )
}

export function AmenitiesStep({
  selectedIds,
  onToggle,
  outstandingIds,
  onToggleOutstanding,
  securityIds,
  onToggleSecurity,
}: AmenitiesStepProps) {
  return (
    <section className="max-w-[720px] mx-auto px-3 sm:px-4 py-4 space-y-8">
      {/* Comodidades preferidas */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-1">
          Cuéntale a los huéspedes todo lo que tu espacio tiene para ofrecer
        </h2>
        <p className="text-sm text-[#717171] mb-1">
          Puedes agregar más comodidades una vez que publiques el anuncio.
        </p>
        <p className="text-sm text-[#222222] mb-4">
          Estas son las comodidades preferidas por los huéspedes. ¿Las tienes?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {preferredAmenityOptions.map((amenity) => (
            <AmenityCard
              key={amenity.id}
              option={amenity}
              isSelected={selectedIds.includes(amenity.id)}
              onToggle={() => onToggle(amenity.id)}
            />
          ))}
        </div>
      </div>

      {/* Comodidades destacadas */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-[#222222] mb-4">
          ¿Tienes alguna comodidad destacada?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {outstandingAmenityOptions.map((amenity) => (
            <AmenityCard
              key={amenity.id}
              option={amenity}
              isSelected={outstandingIds.includes(amenity.id)}
              onToggle={() => onToggleOutstanding(amenity.id)}
            />
          ))}
        </div>
      </div>

      {/* Elementos de seguridad */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-[#222222] mb-4">
          ¿Cuentas con alguno de estos elementos de seguridad?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {securityElementOptions.map((amenity) => (
            <AmenityCard
              key={amenity.id}
              option={amenity}
              isSelected={securityIds.includes(amenity.id)}
              onToggle={() => onToggleSecurity(amenity.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
