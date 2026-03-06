import type { LucideIcon } from 'lucide-react'

export type AccommodationStepKey = 'intro' | 'propertyType' | 'guestAccess' | 'location' | 'basics' | 'standOut' | 'amenities' | 'photos' | 'photoArrange'

export interface PropertyTypeOption {
  id: string
  label: string
  icon: LucideIcon
}

export interface GuestAccessOption {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export interface AmenityOption {
  id: string
  label: string
  icon: LucideIcon
}

export interface AccommodationDraft {
  propertyTypeId: string | null
  guestAccessId: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  guests: number
  beds: number
  bathrooms: number
  amenityIds: string[]
  outstandingAmenityIds: string[]
  securityElementIds: string[]
  photoCount: number
}
