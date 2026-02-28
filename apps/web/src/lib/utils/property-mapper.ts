import type { Property } from '@/types'
import type { PropertyCardDisplay } from '@/components/home/property-carousel'

/** Mapea Property de la API al formato de tarjeta del carousel */
export function toPropertyCardDisplay(p: Property): PropertyCardDisplay {
  const images = Array.isArray(p.images)
    ? p.images
    : typeof p.images === 'string'
      ? (() => {
          try {
            return JSON.parse(p.images as unknown as string) as string[]
          } catch {
            return []
          }
        })()
      : []

  const guestsLabel =
    p.maxGuests === 1 ? '1 huésped' : `${p.maxGuests} huéspedes`
  const bedroomsLabel =
    p.bedrooms === 1 ? '1 cama' : `${p.bedrooms} camas`
  const bathroomsLabel =
    p.bathrooms === 1 ? '1 baño' : `${p.bathrooms} baños`

  const typeLabel =
    p.propertyType && typeof p.propertyType === 'string'
      ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1)
      : 'Alojamiento'

  return {
    id: p.id,
    title: p.title,
    location: `${p.city}, ${p.country}`,
    // Línea 1 bajo la ubicación: resumen del alojamiento usando datos de BD
    distance: `${guestsLabel} · ${typeLabel} · ${bedroomsLabel} · ${bathroomsLabel}`,
    // Línea 2: texto neutro mientras no haya fechas seleccionadas
    dates: 'Fechas flexibles',
    price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
    rating: p.averageRating ?? 0,
    images: Array.isArray(images) ? images : [],
  }
}
