// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  GUEST = 'GUEST',
  HOST = 'HOST',
  ADMIN = 'ADMIN',
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  location: Location;
  price: number;
  amenities: string[];
  images: string[];
  hostId: string;
  createdAt: Date;
}

export interface Location {
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Booking Types
export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// Search Types
export interface SearchQuery {
  query: string;
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SearchResult extends Property {
  relevanceScore: number;
  distance?: number;
}