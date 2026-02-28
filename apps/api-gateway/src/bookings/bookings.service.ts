/**
 * Adaptador HTTP para reservas.
 * Delega en use cases y repositorio; mapea errores de aplicación a excepciones NestJS.
 */

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IBookingsRepository } from './domain/ports/bookings.repository';
import { CreateBookingUseCase } from './application/create-booking.usecase';
import { CancelBookingUseCase } from './application/cancel-booking.usecase';
import { ConfirmBookingUseCase } from './application/confirm-booking.usecase';
import { RejectBookingUseCase } from './application/reject-booking.usecase';
import {
  ApplicationNotFoundError,
  ApplicationForbiddenError,
  ApplicationBadRequestError,
} from './application/errors';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepository: IBookingsRepository,
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
    private readonly rejectBookingUseCase: RejectBookingUseCase,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createBookingDto: { propertyId: string; checkIn: string; checkOut: string; guests: number },
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
        ...this.formatBooking(result.booking),
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      };
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async findAllByGuest(guestId: string, organizationId: string) {
    const bookings = await this.bookingsRepository.findAllByGuest(
      guestId,
      organizationId,
    );
    return bookings.map((b) => this.formatBooking(b));
  }

  async findAllByHost(hostId: string, organizationId?: string | null) {
    const bookings = await this.bookingsRepository.findAllByHost(
      hostId,
      organizationId ?? undefined,
    );
    return bookings.map((b) => this.formatBooking(b));
  }

  async findOne(id: string, userId: string, organizationId?: string | null) {
    const booking = await this.bookingsRepository.findById(
      id,
      organizationId ?? undefined,
    );
    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.property) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }
    return this.formatBooking(booking);
  }

  async cancel(id: string, userId: string, organizationId?: string | null) {
    try {
      const result = await this.cancelBookingUseCase.execute({
        bookingId: id,
        userId,
        organizationId,
      });
      return this.formatBooking(result.booking);
    } catch (err) {
      throw this.mapError(err);
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
        ...this.formatBooking(result.booking),
        paymentBreakdown: result.paymentBreakdown,
      };
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async reject(id: string, hostId: string, organizationId?: string | null) {
    try {
      const result = await this.rejectBookingUseCase.execute({
        bookingId: id,
        hostId,
        organizationId,
      });
      return this.formatBooking(result.booking);
    } catch (err) {
      throw this.mapError(err);
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
    throw err;
  }

  private formatBooking(booking: any) {
    const { property, ...rest } = booking;
    return {
      ...rest,
      totalPrice: rest.totalPrice ? Number(rest.totalPrice) : rest.totalPrice,
      property: property
        ? {
            ...property,
            images:
              typeof property.images === 'string'
                ? JSON.parse(property.images || '[]')
                : property.images,
          }
        : undefined,
    };
  }
}
