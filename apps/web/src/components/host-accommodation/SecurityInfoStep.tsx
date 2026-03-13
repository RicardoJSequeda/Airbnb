'use client'

import Link from 'next/link'

interface SecurityInfoStepProps {
  hasSecurityCameraOutside: boolean
  hasNoiseMonitor: boolean
  hasWeapons: boolean
  onChange: (field: 'camera' | 'noise' | 'weapons', value: boolean) => void
}

export function SecurityInfoStep({
  hasSecurityCameraOutside,
  hasNoiseMonitor,
  hasWeapons,
  onChange,
}: SecurityInfoStepProps) {
  const items = [
    {
      id: 'camera' as const,
      label: 'Hay una cámara de seguridad exterior',
      checked: hasSecurityCameraOutside,
    },
    {
      id: 'noise' as const,
      label: 'Monitor de decibeles de ruido presente',
      checked: hasNoiseMonitor,
    },
    {
      id: 'weapons' as const,
      label: 'Presencia de armas en la propiedad',
      checked: hasWeapons,
    },
  ]

  return (
    <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-3">
        Comparte información de seguridad
      </h2>

      <p className="text-sm font-medium text-[#222222] mb-4">
        ¿Tu alojamiento tiene alguno de estos?{' '}
        <span className="text-[#B0B0B0]" aria-hidden="true">
          ⓘ
        </span>
      </p>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 text-sm text-[#222222]">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onChange(item.id, e.target.checked)}
              className="w-4 h-4 border border-[#B0B0B0] rounded-sm"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className="border-t border-[#DDDDDD] pt-4 text-[11px] text-[#717171] space-y-2 max-w-[620px]">
        <p>
          Debes tener en cuenta lo siguiente: Las cámaras de seguridad que monitorean los espacios
          interiores no están permitidas, incluso si están apagadas. Debes informar la presencia de
          todas las cámaras de seguridad exteriores.
        </p>
        <p>
          Asegúrate de que cumples con la{' '}
          <Link href="#" className="underline">
            legislación local
          </Link>{' '}
          y de revisar la{' '}
          <Link href="#" className="underline">
            Política contra la discriminación de Airbnb
          </Link>
          , así como las{' '}
          <Link href="#" className="underline">
            tarifas para anfitriones y huéspedes
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

