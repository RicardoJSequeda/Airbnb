import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IBookingsRepository } from './domain/ports/bookings.repository';
import type { IStripePort } from './domain/ports/stripe.port';
import type { IRedisPort } from './domain/ports/redis.port';
import { CreateBookingUseCase } from './application/create-booking.usecase';
import { CancelBookingUseCase } from './application/cancel-booking.usecase';
import { ConfirmBookingUseCase } from './application/confirm-booking.usecase';
import { RejectBookingUseCase } from './application/reject-booking.usecase';
import {
  ApplicationNotFoundError,
  ApplicationForbiddenError,
  ApplicationBadRequestError,
} from './application/errors';
import { GetBookingDetailsQuery } from './application/queries/get-booking-details.query';
import { GetBookingsByGuestQuery } from './application/queries/get-bookings-by-guest.query';
import { GetBookingsByHostQuery } from './application/queries/get-bookings-by-host.query';
import { PrismaService } from '../common/prisma.service';

const EXPERIENCE_BOOKING_LOCK_TTL = 60 * 15;

@Injectable()
export class BookingsService {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepository: IBookingsRepository,
    @Inject('IStripePort')
    private readonly stripePort: IStripePort,
    @Inject('IRedisPort')
    private readonly redisPort: IRedisPort,
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
    private readonly rejectBookingUseCase: RejectBookingUseCase,
    private readonly getBookingDetailsQuery: GetBookingDetailsQuery,
    private readonly getBookingsByGuestQuery: GetBookingsByGuestQuery,
    private readonly getBookingsByHostQuery: GetBookingsByHostQuery,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    createBookingDto: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      guests: number;
    },
    guestId: string,
    organizationId: string,
  ) {
    try {
      const result = await this.createBookingUseCase.execute({
        propertyId: createBookingDto.propertyId,
        checkIn: createBookingDto.checkIn,
        checkOut: createBookingDto.checkOut,
        guests: createBookingDto.guests,
        guestId,
        organizationId,
      });
      return {
        bookingId: result.booking.id,
        status: result.booking.status,
        totalPrice: result.booking.totalPrice,
        checkIn: result.booking.checkIn,
        checkOut: result.booking.checkOut,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      };
    } catch (err) {
      this.mapError(err);
    }
  }

  async createExperience(
    dto: {
      experienceId: string;
      slotId: string;
      date: string;
      adults: number;
      children?: number;
    },
    guestId: string,
    organizationId: string,
  ) {
    try {
      const experience = await this.prisma.experience.findUnique({
        where: { id: dto.experienceId },
      });
      if (!experience) {
        throw new NotFoundException('Experience not found');
      }

      const slotDate = new Date(dto.date);

      if (this.redisPort.isAvailable()) {
        const lockKey = `booking:experience:${dto.experienceId}:${dto.slotId}:${dto.date}`;
        const acquired = await this.redisPort.trySetNx(
          lockKey,
          '1',
          EXPERIENCE_BOOKING_LOCK_TTL,
        );
        if (!acquired) {
          throw new ApplicationBadRequestError(
            'This slot is temporarily reserved. Please try again.',
          );
        }
      }

      const overlapping = await this.prisma.booking.findFirst({
        where: {
          propertyId: dto.experienceId,
          checkIn: slotDate,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });
      if (overlapping) {
        throw new ApplicationBadRequestError(
          'Experience slot is not available for the selected date.',
        );
      }

      const pricePerParticipant = Number(experience.pricePerParticipant ?? 0);
      const participants = dto.adults + (dto.children ?? 0);
      const totalPrice = pricePerParticipant * participants;

      const paymentIntent = await this.stripePort.createPaymentIntent(
        totalPrice,
        'usd',
        {
          guestId,
          experienceId: dto.experienceId,
          slotId: dto.slotId,
        },
        true,
      );

      const checkOut = new Date(slotDate);
      checkOut.setHours(checkOut.getHours() + 3);

      const booking = await this.prisma.booking.create({
        data: {
          propertyId: dto.experienceId,
          guestId,
          organizationId: organizationId || (experience.organizationId ?? ''),
          checkIn: slotDate,
          checkOut,
          guests: participants,
          totalPrice,
          status: 'PENDING',
        },
      });

      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          organizationId: booking.organizationId,
          amount: totalPrice,
          currency: 'usd',
          stripePaymentIntentId: paymentIntent.id,
          status: 'PENDING',
        },
      });

      await this.prisma.bookingSummary.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          propertyId: booking.propertyId,
          guestId: booking.guestId,
          hostId: experience.hostId,
          organizationId: booking.organizationId,
          tenantId: 'default',
          regionId: 'global',
          status: booking.status,
          paymentStatus: 'PENDING',
          totalPrice,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        },
        update: {
          status: booking.status,
          paymentStatus: 'PENDING',
          totalPrice,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        },
      });

      return {
        bookingId: booking.id,
        status: booking.status,
        totalPrice: Number(booking.totalPrice),
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (err) {
      this.mapError(err);
    }
  }

  async findAllByGuest(guestId: string, organizationId: string) {
    return this.getBookingsByGuestQuery.execute(guestId, organizationId);
  }

  async findAllByHost(hostId: string, organizationId?: string | null) {
    return this.getBookingsByHostQuery.execute(
      hostId,
      organizationId ?? undefined,
    );
  }

  async findOne(id: string, userId: string, _organizationId?: string | null) {
    void _organizationId;
    const booking = await this.getBookingDetailsQuery.execute(id);
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  async cancel(id: string, userId: string, organizationId?: string | null) {
    try {
      const result = await this.cancelBookingUseCase.execute({
        bookingId: id,
        userId,
        organizationId,
      });
      return {
        bookingId: result.booking.id,
        status: result.booking.status,
      };
    } catch (err) {
      this.mapError(err);
    }
  }

  async confirm(id: string, hostId: string, organizationId?: string | null) {
    try {
      const feePercentage =
        parseFloat(
          this.configService.get<string>('PLATFORM_FEE_PERCENTAGE') ?? '0',
        ) || 0;
      const result = await this.confirmBookingUseCase.execute({
        bookingId: id,
        hostId,
        organizationId,
        platformFeePercentage: feePercentage,
      });
      return {
        bookingId: result.booking.id,
        status: result.booking.status,
        paymentBreakdown: result.paymentBreakdown,
      };
    } catch (err) {
      this.mapError(err);
    }
  }

  async reject(id: string, hostId: string, organizationId?: string | null) {
    try {
      const result = await this.rejectBookingUseCase.execute({
        bookingId: id,
        hostId,
        organizationId,
      });
      return {
        bookingId: result.booking.id,
        status: result.booking.status,
      };
    } catch (err) {
      this.mapError(err);
    }
  }

  private mapError(err: unknown): never {
    if (err instanceof ApplicationNotFoundError) {
      throw new NotFoundException(err.message);
    }
    if (err instanceof ApplicationForbiddenError) {
      throw new ForbiddenException(err.message);
    }
    if (err instanceof ApplicationBadRequestError) {
      throw new BadRequestException(err.message);
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(
      typeof err === 'string' ? err : 'Unexpected error while handling booking',
    );
  }
}
