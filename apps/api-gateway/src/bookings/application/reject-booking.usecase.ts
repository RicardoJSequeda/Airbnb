/**
 * Caso de uso: rechazar reserva (host).
 * Orquesta dominio, repositorios y puertos. No usa Prisma, Stripe SDK ni Redis directo.
 */

import { Inject, Injectable } from '@nestjs/common';
import { Booking, BookingTransitionError } from '../domain/booking.aggregate';
import type { IBookingsRepository } from '../domain/ports/bookings.repository';
import type { IPaymentsRepository } from '../domain/ports/payments.repository';
import type { IStripePort } from '../domain/ports/stripe.port';
import {
  ApplicationBadRequestError,
  ApplicationForbiddenError,
  ApplicationNotFoundError,
} from './errors';

export interface RejectBookingInput {
  bookingId: string;
  hostId: string;
  organizationId?: string | null;
}

export interface RejectBookingOutput {
  booking: {
    id: string;
    status: string;
    propertyId: string;
    guestId: string;
    organizationId: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    property?: { id: string; title: string };
    [key: string]: unknown;
  };
}

@Injectable()
export class RejectBookingUseCase {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepository: IBookingsRepository,
    @Inject('IPaymentsRepository')
    private readonly paymentsRepository: IPaymentsRepository,
    @Inject('IStripePort')
    private readonly stripePort: IStripePort,
  ) {}

  async execute(input: RejectBookingInput): Promise<RejectBookingOutput> {
    const booking = await this.bookingsRepository.findByIdForHost(
      input.bookingId,
      input.hostId,
      input.organizationId ?? undefined,
    );
    if (!booking) {
      throw new ApplicationNotFoundError('Booking not found');
    }
    if (!booking.property) {
      throw new ApplicationNotFoundError('Booking not found');
    }
    if (booking.property.hostId !== input.hostId) {
      throw new ApplicationForbiddenError(
        'Only the property host can reject bookings',
      );
    }

    const aggregate = Booking.fromState({
      id: booking.id,
      propertyId: booking.propertyId,
      guestId: booking.guestId,
      hostId: booking.property.hostId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      status: booking.status,
    });
    try {
      aggregate.reject();
    } catch (err) {
      if (err instanceof BookingTransitionError) {
        throw new ApplicationBadRequestError(
          'Only pending bookings can be rejected',
        );
      }
      throw err;
    }

    await this.bookingsRepository.deleteHold(input.bookingId);

    await this.bookingsRepository.updateBookingStatus(
      input.bookingId,
      aggregate.status,
      aggregate.pullDomainEvents(),
    );

    const updated = await this.bookingsRepository.findById(
      input.bookingId,
      input.organizationId ?? undefined,
    );
    if (!updated) {
      throw new ApplicationNotFoundError('Booking not found');
    }

    return {
      booking: updated as RejectBookingOutput['booking'],
    };
  }
}
