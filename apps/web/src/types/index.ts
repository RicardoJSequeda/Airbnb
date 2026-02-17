export interface User {
  id: string
  email: string
  name: string
  role: 'GUEST' | 'HOST' | 'ADMIN'
  avatar?: string
  createdAt: string
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: string
  propertyType: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDO' | 'STUDIO' | 'CABIN'
  maxGuests: number
  bedrooms: number
  bathrooms: number
  address: string
  city: string
  state?: string
  country: string
  zipCode: string
  latitude: number
  longitude: number
  amenities: string[]
  images: string[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  hostId: string
  host?: User
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  propertyId: string
  property?: Property
  guestId: string
  guest?: User
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  bookingId: string
  booking?: Booking
  amount: number
  currency: string
  stripePaymentIntentId: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  bookingId: string
  booking?: Booking
  propertyId: string
  property?: Property
  userId: string
  user?: User
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
}

export interface Favorite {
  id: string
  userId: string
  propertyId: string
  property?: Property
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}