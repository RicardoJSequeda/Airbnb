/**
 * Caso de uso: crear reserva.
 * Orquesta dominio, repositorios y puertos. No usa Prisma, Stripe SDK ni Redis directo.
 */

import { Inject, Injectable } from '@nestjs/common';
import { Booking } from '../domain/booking.aggregate';
import { hasDateConflict } from '../domain/booking-availability.domain';
import type { ExistingBookingSlot } from '../domain/booking-availability.domain';
import type { IBookingsRepository } from '../domain/ports/bookings.repository';
import type { IStripePort } from '../domain/ports/stripe.port';
import type { IRedisPort } from '../domain/ports/redis.port';
import {
  ApplicationBadRequestError,
  ApplicationNotFoundError,
} from './errors';

const BOOKING_LOCK_TTL = 60 * 15;
const BOOKING_HOLD_TTL = 60 * 15;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 10;
const HOLD_KEY_PREFIX = 'booking:hold:';
const RATE_KEY_PREFIX = 'booking:ratelimit:';
const LOCK_KEY_PREFIX = 'booking:lock:';

export interface CreateBookingInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestId: string;
  organizationId: string;
}

export interface CreateBookingOutput {
  booking: {
    id: string;
    propertyId: string;
    guestId: string;
    organizationId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
    status: string;
    property?: unknown;
    guest?: unknown;
  };
  clientSecret: string | null;
  paymentIntentId: string;
}

@Injectable()
export class CreateBookingUseCase {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepository: IBookingsRepository,
    @Inject('IStripePort')
    private readonly stripePort: IStripePort,
    @Inject('IRedisPort')
    private readonly redisPort: IRedisPort,
  ) {}

  async execute(input: CreateBookingInput): Promise<CreateBookingOutput> {
    const checkInDate = new Date(input.checkIn);
    const checkOutDate = new Date(input.checkOut);
    const now = new Date();

    if (this.redisPort.isAvailable()) {
      const rateKey = `${RATE_KEY_PREFIX}${input.guestId}`;
      const count = await this.redisPort.incr(rateKey);
      if (count === 1) await this.redisPort.expire(rateKey, RATE_LIMIT_WINDOW);
      if (count > RATE_LIMIT_MAX) {
        throw new ApplicationBadRequestError(
          'Too many booking attempts. Please try again later.',
        );
      }

      const lockKey = `${LOCK_KEY_PREFIX}${input.propertyId}:${input.checkIn}:${input.checkOut}`;
      const acquired = await this.redisPort.trySetNx(
        lockKey,
        '1',
        BOOKING_LOCK_TTL,
      );
      if (!acquired) {
        throw new ApplicationBadRequestError(
          'This slot is temporarily reserved. Please try again in a few minutes.',
        );
      }
    }

    const property = await this.bookingsRepository.findProperty(
      input.propertyId,
      input.organizationId,
    );
    if (!property) {
      throw new ApplicationNotFoundError('Property not found');
    }
    if (property.status !== 'PUBLISHED') {
      throw new ApplicationBadRequestError(
        'Property is not available for booking',
      );
    }

    const createResult = Booking.create(
      {
        propertyId: input.propertyId,
        guestId: input.guestId,
        hostId: property.hostId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: input.guests,
        maxGuestsAllowed: property.maxGuests,
        pricePerNight: property.price,
      },
      now,
    );
    if (!createResult.success) {
      if (createResult.error === 'CHECK_IN_IN_PAST') {
        throw new ApplicationBadRequestError(
          'Check-in date must be in the future',
        );
      }
      if (createResult.error === 'CHECK_OUT_BEFORE_CHECK_IN') {
        throw new ApplicationBadRequestError(
          'Check-out date must be after check-in date',
        );
      }
      if (createResult.error === 'TOO_MANY_GUESTS') {
        throw new ApplicationBadRequestError(
          `Property allows maximum ${property.maxGuests} guests`,
        );
      }
      throw new ApplicationBadRequestError('Invalid booking request');
    }
    const bookingAggregate = createResult.booking;

    const paymentIntent = await this.stripePort.createPaymentIntent(
      bookingAggregate.totalPrice,
      'usd',
      {
        guestId: input.guestId,
        propertyTitle: property.title,
      },
      true,
    );

    let created: BookingSnapshotFromRepo | null = null;
    try {
      const { confirmed, pending } =
        await this.bookingsRepository.getOverlappingSlots(
          input.propertyId,
          checkInDate,
          checkOutDate,
        );

      const blockingSlots: ExistingBookingSlot[] = [
        ...confirmed,
        ...(await this.filterPendingWithHold(pending)),
      ];

      if (
        hasDateConflict(
          bookingAggregate.checkIn,
          bookingAggregate.checkOut,
          blockingSlots,
        )
      ) {
        throw new ApplicationBadRequestError(
          'Property is not available for selected dates',
        );
      }

      created = await this.bookingsRepository.createBookingAndPayment(
        {
          propertyId: input.propertyId,
          guestId: input.guestId,
          organizationId: property.organizationId,
          checkIn: bookingAggregate.checkIn,
          checkOut: bookingAggregate.checkOut,
          guests: input.guests,
          totalPrice: bookingAggregate.totalPrice,
          status: bookingAggregate.status,
        },
        paymentIntent.id,
        bookingAggregate.pullDomainEvents(),
      );

      await this.bookingsRepository.setHold(
        created.id,
        input.guestId,
        BOOKING_HOLD_TTL,
      );

      return {
        booking: {
          id: created.id,
          propertyId: created.propertyId,
          guestId: created.guestId,
          organizationId: created.organizationId,
          checkIn: created.checkIn,
          checkOut: created.checkOut,
          guests: input.guests,
          totalPrice: created.totalPrice,
          status: created.status,
          property: (created as { property?: unknown }).property,
          guest: (created as { guest?: unknown }).guest,
        },
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (err) {
      if (paymentIntent.id && !created) {
        try {
          await this.stripePort.cancelPaymentIntent(paymentIntent.id);
        } catch {
          /* ignore */
        }
      }
      throw err;
    }
  }

  private async filterPendingWithHold(
    pending: Array<{ id: string; startDate: Date; endDate: Date; status: string }>,
  ): Promise<ExistingBookingSlot[]> {
    if (!this.redisPort.isAvailable()) return [];
    const out: ExistingBookingSlot[] = [];
    for (const p of pending) {
      const held = await this.redisPort.get(`${HOLD_KEY_PREFIX}${p.id}`);
      if (held !== null) {
        out.push({ startDate: p.startDate, endDate: p.endDate, status: p.status });
      }
    }
    return out;
  }
}

type BookingSnapshotFromRepo = Awaited<
  ReturnType<IBookingsRepository['createBookingAndPayment']>
>;
