export interface Experience {
  id: string
  title: string
  description: string
  pricePerParticipant: number
  currency: string
  maxParticipants: number
  duration: number // en minutos
  category: string
  status: string
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  latitude: number
  longitude: number
  includes: string[]
  excludes: string[]
  images: string[]
  meetingPoint?: string
  languages: string[]
  ageRestriction?: string
  hostId: string
  host?: { id: string; name: string; avatar?: string | null; email?: string }
  hostOccupation?: string
  hostBio?: string
  hostRegistrationNumber?: string
  averageRating?: number
  totalReviews?: number
  reviews?: ExperienceReview[]
  createdAt: string
  updatedAt: string
}

export interface ExperienceReview {
  id: string
  rating: number
  comment: string
  guest: { name: string; avatar?: string | null }
  createdAt: string
}

export interface ExperienceBooking {
  id: string
  experienceId: string
  guestId: string
  date: string
  participants: number
  totalPrice: number
  status: string
  createdAt: string
  updatedAt: string
}
