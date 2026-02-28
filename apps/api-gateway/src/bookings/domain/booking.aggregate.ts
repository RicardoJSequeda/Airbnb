/**
 * Aggregate Root - Dominio puro.
 * Encapsula reglas de negocio de reserva: validaciones, cálculos y transiciones de estado.
 * No usa Prisma, Redis ni Stripe.
 */

import {
  BookingDateValidationError,
  BookingStatus,
  calculateNights,
  validateBookingDates,
  canCancel,
  canConfirm,
  canReject,
} from './booking.domain';
import { calculateBookingTotal } from './booking-pricing.domain';
import type { DomainEvent } from './events/domain-event.interface';

export type CreateBookingParams = {
  propertyId: string;
  guestId: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  maxGuestsAllowed: number;
  pricePerNight: number;
};

export type CreateBookingResult =
  | { success: true; booking: Booking }
  | { success: false; error: BookingDateValidationError | 'TOO_MANY_GUESTS' };

/** Error de transición de estado; la capa de aplicación lo mapea a HTTP. */
export class BookingTransitionError extends Error {
  constructor(public readonly code: string) {
    super(`Booking transition not allowed: ${code}`);
    this.name = 'BookingTransitionError';
  }
}

export class Booking {
  id?: string;
  readonly propertyId: string;
  readonly guestId: string;
  readonly hostId: string;
  readonly checkIn: Date;
  readonly checkOut: Date;
  readonly nights: number;
  readonly totalPrice: number;
  status: string;

  private domainEvents: DomainEvent[] = [];

  private constructor(props: {
    id?: string;
    propertyId: string;
    guestId: string;
    hostId: string;
    checkIn: Date;
    checkOut: Date;
    nights: number;
    totalPrice: number;
    status: string;
  }) {
    this.id = props.id;
    this.propertyId = props.propertyId;
    this.guestId = props.guestId;
    this.hostId = props.hostId;
    this.checkIn = props.checkIn;
    this.checkOut = props.checkOut;
    this.nights = props.nights;
    this.totalPrice = props.totalPrice;
    this.status = props.status;
  }

  /**
   * Crea una reserva nueva: valida fechas, calcula nights y totalPrice, status PENDING.
   */
  static create(
    params: CreateBookingParams,
    now: Date = new Date(),
  ): CreateBookingResult {
    const dateError = validateBookingDates(
      params.checkIn,
      params.checkOut,
      now,
    );
    if (dateError) {
      return { success: false, error: dateError };
    }
    if (params.guests > params.maxGuestsAllowed) {
      return { success: false, error: 'TOO_MANY_GUESTS' };
    }

    const nights = calculateNights(params.checkIn, params.checkOut);
    const totalPrice = calculateBookingTotal(
      params.pricePerNight,
      nights,
    );
    const booking = new Booking({
        propertyId: params.propertyId,
        guestId: params.guestId,
        hostId: params.hostId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights,
        totalPrice,
        status: BookingStatus.PENDING,
      });

    booking.addDomainEvent({
      aggregateId: '', // se rellenará con el id persistido en el repositorio
      type: 'BOOKING_CREATED',
      occurredAt: now,
      payload: {
        propertyId: params.propertyId,
        guestId: params.guestId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests,
        totalPrice,
      },
    });

    return {
      success: true,
      booking,
    };
  }

  /**
   * Reconstituye el agregado desde persistencia (para cancel/confirm/reject).
   * Si nights no se pasa, se calcula a partir de checkIn/checkOut.
   */
  static fromState(props: {
    id: string;
    propertyId: string;
    guestId: string;
    hostId: string;
    checkIn: Date;
    checkOut: Date;
    nights?: number;
    totalPrice: number;
    status: string;
  }): Booking {
    const nights =
      props.nights ?? calculateNights(props.checkIn, props.checkOut);
    return new Booking({ ...props, nights });
  }

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  cancel(): void {
    if (!canCancel(this.status)) {
      if (this.status === BookingStatus.CANCELLED) {
        throw new BookingTransitionError('ALREADY_CANCELLED');
      }
      throw new BookingTransitionError('CANNOT_CANCEL_COMPLETED');
    }
    this.status = BookingStatus.CANCELLED;
    this.addDomainEvent({
      aggregateId: this.id ?? '',
      type: 'BOOKING_CANCELLED',
      occurredAt: new Date(),
      payload: {
        bookingId: this.id,
        propertyId: this.propertyId,
        guestId: this.guestId,
      },
    });
  }

  confirm(): void {
    if (!canConfirm(this.status)) {
      throw new BookingTransitionError('ONLY_PENDING_CAN_BE_CONFIRMED');
    }
    this.status = BookingStatus.CONFIRMED;
    this.addDomainEvent({
      aggregateId: this.id ?? '',
      type: 'BOOKING_CONFIRMED',
      occurredAt: new Date(),
      payload: {
        bookingId: this.id,
        propertyId: this.propertyId,
        guestId: this.guestId,
      },
    });
  }

  reject(): void {
    if (!canReject(this.status)) {
      throw new BookingTransitionError('ONLY_PENDING_CAN_BE_REJECTED');
    }
    this.status = BookingStatus.REJECTED;
    this.addDomainEvent({
      aggregateId: this.id ?? '',
      type: 'BOOKING_REJECTED',
      occurredAt: new Date(),
      payload: {
        bookingId: this.id,
        propertyId: this.propertyId,
        guestId: this.guestId,
      },
    });
  }
}
