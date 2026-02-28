/**
 * Caso de uso: confirmar reserva (host captura pago).
 * Orquesta dominio, repositorios y puertos. No usa Prisma, Stripe SDK ni Redis directo.
 */

import { Inject, Injectable } from '@nestjs/common';
import { Booking, BookingTransitionError } from '../domain/booking.aggregate';
import { calculatePlatformFee } from '../domain/booking-pricing.domain';
import type { IBookingsRepository } from '../domain/ports/bookings.repository';
import type { IPaymentsRepository } from '../domain/ports/payments.repository';
import type { IStripePort } from '../domain/ports/stripe.port';
import {
  ApplicationBadRequestError,
  ApplicationForbiddenError,
  ApplicationNotFoundError,
} from './errors';

export interface ConfirmBookingInput {
  bookingId: string;
  hostId: string;
  organizationId?: string | null;
  platformFeePercentage: number;
}

export interface ConfirmBookingOutput {
  booking: {
    id: string;
    status: string;
    propertyId: string;
    guestId: string;
    organizationId: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    [key: string]: unknown;
  };
  paymentBreakdown: {
    totalAmount: number;
    platformFee: number;
    hostNetAmount: number;
  };
}

@Injectable()
export class ConfirmBookingUseCase {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepository: IBookingsRepository,
    @Inject('IPaymentsRepository')
    private readonly paymentsRepository: IPaymentsRepository,
    @Inject('IStripePort')
    private readonly stripePort: IStripePort,
  ) {}

  async execute(input: ConfirmBookingInput): Promise<ConfirmBookingOutput> {
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
        'Only the property host can confirm bookings',
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
      aggregate.confirm();
    } catch (err) {
      if (err instanceof BookingTransitionError) {
        throw new ApplicationBadRequestError(
          'Only pending bookings can be confirmed',
        );
      }
      throw err;
    }

    const totalAmount = Number(aggregate.totalPrice);
    const feePercentage = input.platformFeePercentage;
    const { platformFee, hostNet } = calculatePlatformFee(
      totalAmount,
      feePercentage,
    );

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
      booking: updated as ConfirmBookingOutput['booking'],
      paymentBreakdown: {
        totalAmount,
        platformFee,
        hostNetAmount: hostNet,
      },
    };
  }
}
