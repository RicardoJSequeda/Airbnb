import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

const fields = [
  { label: 'Dónde', value: 'En cualquier lugar del mundo' },
  { label: 'Fechas', value: 'Cualquier fecha' },
  { label: 'Tipo de servicio', value: 'Agregar servicio' },
]

export default function ServicesSearchBar() {
  const router = useRouter()

  const handleSearchClick = () => {
    // Reutilizamos la misma página de búsqueda de experiencias
    // pasando filtros básicos para Bogotá (puedes ajustar esto luego).
    const params = new URLSearchParams({
      city: 'Bogotá',
      dateType: 'any',
    })
    router.push(`/experiences/search?${params.toString()}`)
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-5xl rounded-full border border-[#DDDDDD] bg-white p-2 shadow-sm">
      <div className="flex items-center">
        {fields.map((field, index) => (
          <div key={field.label} className="flex flex-1 items-center">
            <button
              type="button"
              className="w-full rounded-full px-6 py-2 text-left hover:bg-[#F7F7F7]"
            >
              <p className="text-sm font-semibold text-[#222222]">{field.label}</p>
              <p className="text-[18px] leading-6 text-[#6A6A6A]">{field.value}</p>
            </button>
            {index < fields.length - 1 ? (
              <div className="h-10 w-px bg-[#DDDDDD]" aria-hidden />
            ) : null}
          </div>
        ))}

        <button
          type="button"
          onClick={handleSearchClick}
          className="ml-2 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition hover:brightness-95"
          aria-label="Buscar servicios"
        >
          <Search className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
