import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { StripeService } from '../payments/stripe.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { calculatePlatformFee } from '../common/commission.utils';

const BOOKING_LOCK_TTL = 60 * 15;
const BOOKING_HOLD_TTL = 60 * 15;
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 10;

const holdKey = (bookingId: string) => `booking:hold:${bookingId}`;

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    guestId: string,
    organizationId: string,
  ) {
    const { propertyId, checkIn, checkOut, guests } = createBookingDto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    if (checkInDate < now) {
      throw new BadRequestException('Check-in date must be in the future');
    }

    if (checkOutDate <= checkInDate) {
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    }

    if (this.redis.isAvailable()) {
      const rateKey = `booking:ratelimit:${guestId}`;
      const count = await this.redis.incr(rateKey);
      if (count === 1) await this.redis.expire(rateKey, RATE_LIMIT_WINDOW);
      if (count > RATE_LIMIT_MAX) {
        throw new BadRequestException(
          'Too many booking attempts. Please try again later.',
        );
      }

      const lockKey = `booking:lock:${propertyId}:${checkIn}:${checkOut}`;
      const client = this.redis.getClient();
      const acquired =
        client &&
        (await client.set(lockKey, '1', 'EX', BOOKING_LOCK_TTL, 'NX')) === 'OK';
      if (!acquired && client) {
        throw new BadRequestException(
          'This slot is temporarily reserved. Please try again in a few minutes.',
        );
      }
    }

    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, organizationId },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.status !== 'PUBLISHED') {
      throw new BadRequestException('Property is not available for booking');
    }
    if (guests > property.maxGuests) {
      throw new BadRequestException(
        `Property allows maximum ${property.maxGuests} guests`,
      );
    }

    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = Number(property.price) * nights;

    const paymentIntent = await this.stripeService.createPaymentIntent(
      totalPrice,
      'usd',
      {
        guestId,
        propertyTitle: property.title,
      },
      true, // manual capture - host confirms to capture
    );
    const paymentIntentId = paymentIntent.id;

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const conflictingConfirmed = await tx.booking.findFirst({
            where: {
              propertyId,
              status: BookingStatus.CONFIRMED,
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
          });
          if (conflictingConfirmed) {
            throw new BadRequestException(
              'Property is not available for selected dates',
            );
          }

          const conflictingPending = await tx.booking.findMany({
            where: {
              propertyId,
              status: BookingStatus.PENDING,
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
          });
          for (const b of conflictingPending) {
            const hasActiveHold =
              this.redis.isAvailable() &&
              (await this.redis.get(holdKey(b.id))) !== null;
            if (hasActiveHold) {
              throw new BadRequestException(
                'Property is not available for selected dates',
              );
            }
          }

          const newBooking = await tx.booking.create({
            data: {
              propertyId,
              guestId,
              organizationId: property.organizationId,
              checkIn: checkInDate,
              checkOut: checkOutDate,
              guests,
              totalPrice,
              status: BookingStatus.PENDING,
            },
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  city: true,
                  country: true,
                  images: true,
                },
              },
              guest: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          });

          await tx.payment.create({
            data: {
              bookingId: newBooking.id,
              organizationId: property.organizationId,
              amount: totalPrice,
              currency: 'usd',
              stripePaymentIntentId: paymentIntentId,
              status: 'PENDING',
            },
          });

          if (this.redis.isAvailable()) {
            await this.redis.set(
              holdKey(newBooking.id),
              newBooking.guestId,
              BOOKING_HOLD_TTL,
            );
          }

          return {
            booking: newBooking,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntentId,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return {
        ...this.formatBooking(result.booking),
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      };
    } catch (err) {
      if (paymentIntentId) {
        try {
          await this.stripeService.cancelPaymentIntent(paymentIntentId);
        } catch {
          /* ignore */
        }
      }
      throw err;
    }
  }

  async findAllByGuest(guestId: string, organizationId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { guestId, organizationId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: true,
          },
        },
        review: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.formatBooking(b));
  }

  async findAllByHost(hostId: string, organizationId?: string | null) {
    const where: { property: { hostId: string; organizationId?: string } } = {
      property: { hostId },
    };
    if (organizationId) where.property.organizationId = organizationId;

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: true,
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.formatBooking(b));
  }

  async findOne(id: string, userId: string, organizationId?: string | null) {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) where.organizationId = organizationId;

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }
    return this.formatBooking(booking);
  }

  async cancel(id: string, userId: string, organizationId?: string | null) {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) where.organizationId = organizationId;

    const booking = await this.prisma.booking.findFirst({
      where,
      include: { property: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId: id },
    });
    if (
      payment?.stripePaymentIntentId &&
      booking.status === BookingStatus.PENDING
    ) {
      try {
        await this.stripeService.cancelPaymentIntent(
          payment.stripePaymentIntentId,
        );
      } catch {
        /* ignore */
      }
      await this.prisma.payment.update({
        where: { bookingId: id },
        data: { status: 'CANCELLED' as const },
      });
    }

    if (this.redis.isAvailable()) await this.redis.del(holdKey(id));

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        property: { select: { id: true, title: true } },
      },
    });
    return this.formatBooking(updated);
  }

  async confirm(id: string, hostId: string, organizationId?: string | null) {
    const where: {
      id: string;
      property: { hostId: string; organizationId?: string };
    } = {
      id,
      property: { hostId },
    };
    if (organizationId) where.property.organizationId = organizationId;

    const booking = await this.prisma.booking.findFirst({
      where,
      include: { property: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.property.hostId !== hostId) {
      throw new ForbiddenException(
        'Only the property host can confirm bookings',
      );
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId: id },
    });
    if (!payment?.stripePaymentIntentId) {
      throw new BadRequestException('Payment intent not found');
    }

    const paymentIntent = await this.stripeService.retrievePaymentIntent(
      payment.stripePaymentIntentId,
    );
    if (paymentIntent.status !== 'requires_capture') {
      throw new BadRequestException(
        'Guest must authorize payment before host can confirm',
      );
    }

    await this.stripeService.capturePaymentIntent(
      payment.stripePaymentIntentId,
    );

    // Calcular comisión solo en transición PENDING -> COMPLETED. Usamos Prisma.Decimal para
    // precisión (evita errores de punto flotante). El cálculo es atómico con el update.
    const totalAmount = booking.totalPrice;
    const feePercentage =
      parseFloat(
        this.configService.get<string>('PLATFORM_FEE_PERCENTAGE') ?? '0',
      ) || 0;
    const { platformFee, hostNet } = calculatePlatformFee(
      totalAmount,
      feePercentage,
    );

    await this.prisma.payment.update({
      where: { bookingId: id },
      data: {
        status: 'COMPLETED' as const,
        paidAt: new Date(),
        platformFeeAmount: platformFee,
        hostNetAmount: hostNet,
      },
    });

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
    });

    if (this.redis.isAvailable()) await this.redis.del(holdKey(id));

    return {
      ...this.formatBooking(updated),
      paymentBreakdown: {
        totalAmount: Number(totalAmount),
        platformFee: Number(platformFee),
        hostNetAmount: Number(hostNet),
      },
    };
  }

  async reject(id: string, hostId: string, organizationId?: string | null) {
    const where: {
      id: string;
      property: { hostId: string; organizationId?: string };
    } = {
      id,
      property: { hostId },
    };
    if (organizationId) where.property.organizationId = organizationId;

    const booking = await this.prisma.booking.findFirst({
      where,
      include: { property: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.property.hostId !== hostId) {
      throw new ForbiddenException(
        'Only the property host can reject bookings',
      );
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId: id },
    });
    if (payment?.stripePaymentIntentId) {
      try {
        await this.stripeService.cancelPaymentIntent(
          payment.stripePaymentIntentId,
        );
      } catch {
        /* ignore */
      }
      await this.prisma.payment.update({
        where: { bookingId: id },
        data: { status: 'CANCELLED' as const },
      });
    }

    if (this.redis.isAvailable()) await this.redis.del(holdKey(id));

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.REJECTED },
      include: {
        property: { select: { id: true, title: true } },
      },
    });
    return this.formatBooking(updated);
  }

  private formatBooking(booking: any) {
    const { property, ...rest } = booking;
    return {
      ...rest,
      totalPrice: rest.totalPrice ? Number(rest.totalPrice) : rest.totalPrice,
      property: property
        ? {
            ...property,
            images: JSON.parse(property.images || '[]'),
          }
        : undefined,
    };
  }
}
