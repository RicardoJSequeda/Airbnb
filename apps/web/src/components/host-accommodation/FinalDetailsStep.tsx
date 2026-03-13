'use client'

interface FinalDetailsStepProps {
  country: string
  address: string
  addressExtra: string
  city: string
  region: string
  isBusinessHost: boolean | null
  onChange: (field: 'country' | 'address' | 'addressExtra' | 'city' | 'region', value: string) => void
  onBusinessChange: (value: boolean) => void
}

export function FinalDetailsStep({
  country,
  address,
  addressExtra,
  city,
  region,
  isBusinessHost,
  onChange,
  onBusinessChange,
}: FinalDetailsStepProps) {
  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-2">
        Proporciona algunos datos finales
      </h2>
      <p className="text-sm text-[#717171] mb-6 max-w-[520px]">
        Este paso es necesario para cumplir con la normativa financiera y ayudarnos a prevenir el
        fraude.
      </p>

      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#222222]">¿Dónde vives?</p>
          <p className="text-xs text-[#717171]">
            Los huéspedes no tendrán acceso a esta información.
          </p>

          <select
            value={country}
            onChange={(e) => onChange('country', e.target.value)}
            className="w-full mt-2 rounded-lg border border-[#B0B0B0] px-3 py-2 text-sm text-[#222222] bg-white"
          >
            <option value="">Selecciona país/región</option>
            <option value="Colombia">Colombia</option>
          </select>

          <input
            value={address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Dirección"
            className="w-full rounded-lg border border-[#B0B0B0] px-3 py-2 text-sm text-[#222222]"
          />
          <input
            value={addressExtra}
            onChange={(e) => onChange('addressExtra', e.target.value)}
            placeholder="Apartamento, piso, edificio (si corresponde)"
            className="w-full rounded-lg border border-[#B0B0B0] px-3 py-2 text-sm text-[#222222]"
          />
          <input
            value={city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="Ciudad/municipio"
            className="w-full rounded-lg border border-[#B0B0B0] px-3 py-2 text-sm text-[#222222]"
          />
          <input
            value={region}
            onChange={(e) => onChange('region', e.target.value)}
            placeholder="Departamento"
            className="w-full rounded-lg border border-[#B0B0B0] px-3 py-2 text-sm text-[#222222]"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-[#DDDDDD] mt-2">
          <p className="text-sm font-medium text-[#222222]">¿Anfitrionas como empresa?</p>
          <p className="text-xs text-[#717171] mb-2">
            Esto significa que seguramente tu empresa está registrada ante las autoridades locales o
            estatales pertinentes.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onBusinessChange(true)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
                isBusinessHost === true
                  ? 'border-[#222222] bg-[#222222] text-white'
                  : 'border-[#DDDDDD] bg-white text-[#222222]'
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => onBusinessChange(false)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
                isBusinessHost === false
                  ? 'border-[#222222] bg-[#222222] text-white'
                  : 'border-[#DDDDDD] bg-white text-[#222222]'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

