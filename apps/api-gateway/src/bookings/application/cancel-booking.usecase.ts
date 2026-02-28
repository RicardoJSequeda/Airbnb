/**
 * Caso de uso: cancelar reserva.
 * Orquesta dominio y repositorios. No usa Prisma, Stripe SDK ni Redis directo.
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

export interface CancelBookingInput {
  bookingId: string;
  userId: string;
  organizationId?: string | null;
}

export interface CancelBookingOutput {
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
export class CancelBookingUseCase {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepository: IBookingsRepository,
    @Inject('IPaymentsRepository')
    private readonly paymentsRepository: IPaymentsRepository,
    @Inject('IStripePort')
    private readonly stripePort: IStripePort,
  ) {}

  async execute(input: CancelBookingInput): Promise<CancelBookingOutput> {
    const booking = await this.bookingsRepository.findById(
      input.bookingId,
      input.organizationId ?? undefined,
    );
    if (!booking) {
      throw new ApplicationNotFoundError('Booking not found');
    }
    if (!booking.property) {
      throw new ApplicationNotFoundError('Booking not found');
    }
    if (
      booking.guestId !== input.userId &&
      booking.property.hostId !== input.userId
    ) {
      throw new ApplicationForbiddenError(
        'You can only cancel your own bookings',
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
      aggregate.cancel();
    } catch (err) {
      if (err instanceof BookingTransitionError) {
        if (err.code === 'ALREADY_CANCELLED') {
          throw new ApplicationBadRequestError('Booking is already cancelled');
        }
        throw new ApplicationBadRequestError(
          'Cannot cancel completed booking',
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
      booking: updated as CancelBookingOutput['booking'],
    };
  }
}
