import type { LucideIcon } from 'lucide-react'

export type AccommodationStepKey = 'intro' | 'propertyType' | 'guestAccess'

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

export interface AccommodationDraft {
  propertyTypeId: string | null
  guestAccessId: string | null
}
