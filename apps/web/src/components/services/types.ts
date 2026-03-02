export interface ServiceCategory {
  id: string
  name: string
  imageUrl: string
  availability: string
}

export interface ServiceOffer {
  id: string
  title: string
  city: string
  price: string
  minimum?: string
  ratingText?: string
  badge?: string
  imageUrl: string
}

export interface ServiceSectionData {
  id: string
  title: string
  offers: ServiceOffer[]
}
