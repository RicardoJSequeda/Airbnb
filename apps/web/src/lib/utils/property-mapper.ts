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
  return {
    id: p.id,
    title: p.title,
    location: `${p.city}, ${p.country}`,
    distance: '—',
    dates: '—',
    price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
    rating: 0,
    images: Array.isArray(images) ? images : [],
  }
}
