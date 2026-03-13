import type { LucideIcon } from 'lucide-react'

export type AccommodationStepKey =
  | 'intro'
  | 'propertyType'
  | 'guestAccess'
  | 'location'
  | 'basics'
  | 'standOut'
  | 'amenities'
  | 'photos'
  | 'photoArrange'
  | 'title'
  | 'description'
  | 'highlights'
  | 'finishIntro'
  | 'reservationPreferences'
  | 'basePrice'
  | 'weekendPrice'
  | 'discounts'
  | 'securityInfo'
  | 'finalDetails'

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
  title: string | null
  description: string | null
  highlights: string[]
  reservationPreference: 'approveFirst5' | 'instant' | null
  basePrice: number | null
  weekendPremiumPercent: number | null
  discounts: string[]
  hasSecurityCameraOutside: boolean
  hasNoiseMonitor: boolean
  hasWeapons: boolean
  finalCountry: string | null
  finalAddress: string
  finalAddressExtra: string
  finalCity: string
  finalRegion: string
  isBusinessHost: boolean | null
}
