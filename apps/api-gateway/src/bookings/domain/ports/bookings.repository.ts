/**
 * Puerto de salida para persistencia de reservas.
 * Dominio/Application no importan Prisma.
 */

import type { ExistingBookingSlot } from '../booking-availability.domain';
import type { DomainEvent } from '../events/domain-event.interface';

/** Slot con id para poder comprobar hold en Redis (solo para pending). */
export type OverlappingSlotWithId = ExistingBookingSlot & { id: string };

export interface PropertySnapshot {
  id: string;
  hostId: string;
  organizationId: string;
  title: string;
  price: number;
  maxGuests: number;
  status: string;
}

export interface CreateBookingData {
  propertyId: string;
  guestId: string;
  organizationId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: string;
}


export interface BookingSnapshot {
  id: string;
  propertyId: string;
  guestId: string;
  organizationId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: string;
  property?: {
    id: string;
    hostId: string;
    title?: string;
    images?: string;
    city?: string;
    country?: string;
    host?: { id: string; name: string; email: string; avatar: string | null };
  };
  guest?: { id: string; name: string; email: string; avatar: string | null };
  payment?: { id: string; stripePaymentIntentId: string | null; status: string };
}

export interface IBookingsRepository {
  findProperty(
    propertyId: string,
    organizationId: string,
  ): Promise<PropertySnapshot | null>;

  getOverlappingSlots(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<{
    confirmed: ExistingBookingSlot[];
    pending: OverlappingSlotWithId[];
  }>;

  createBookingAndPayment(
    booking: CreateBookingData,
    paymentIntentId: string,
    events: DomainEvent[],
  ): Promise<BookingSnapshot>;

  findById(
    id: string,
    organizationId?: string | null,
  ): Promise<BookingSnapshot | null>;

  findByIdForHost(
    id: string,
    hostId: string,
    organizationId?: string | null,
  ): Promise<BookingSnapshot | null>;

  updateBookingStatus(
    id: string,
    status: string,
    events: DomainEvent[],
  ): Promise<void>;

  setHold(bookingId: string, guestId: string, ttlSeconds: number): Promise<void>;
  deleteHold(bookingId: string): Promise<void>;

  findAllByGuest(
    guestId: string,
    organizationId: string,
  ): Promise<BookingSnapshot[]>;

  findAllByHost(
    hostId: string,
    organizationId?: string | null,
  ): Promise<BookingSnapshot[]>;
}
