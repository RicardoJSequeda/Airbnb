/**
 * Implementación de IBookingsRepository con Prisma.
 * Usa IRedisPort para setHold/deleteHold.
 */

import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type {
  IBookingsRepository,
  PropertySnapshot,
  BookingSnapshot,
  CreateBookingData,
  OverlappingSlotWithId,
} from '../domain/ports/bookings.repository';
import type { ExistingBookingSlot } from '../domain/booking-availability.domain';
import type { DomainEvent } from '../domain/events/domain-event.interface';
import type { IRedisPort } from '../domain/ports/redis.port';

const HOLD_KEY_PREFIX = 'booking:hold:';

@Injectable()
export class PrismaBookingsRepository implements IBookingsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IRedisPort') private readonly redisPort: IRedisPort,
  ) {}

  async findProperty(
    propertyId: string,
    organizationId: string,
  ): Promise<PropertySnapshot | null> {
    const p = await this.prisma.property.findFirst({
      where: { id: propertyId, organizationId },
    });
    if (!p) return null;
    return {
      id: p.id,
      hostId: p.hostId,
      organizationId: p.organizationId,
      title: p.title,
      price: Number(p.price),
      maxGuests: p.maxGuests,
      status: p.status,
    };
  }

  async getOverlappingSlots(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<{
    confirmed: ExistingBookingSlot[];
    pending: OverlappingSlotWithId[];
  }> {
    const [confirmed, pending] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          propertyId,
          status: 'CONFIRMED',
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          propertyId,
          status: 'PENDING',
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      }),
    ]);

    return {
      confirmed: confirmed.map((b) => ({
        startDate: b.checkIn,
        endDate: b.checkOut,
        status: b.status,
      })),
      pending: pending.map((b) => ({
        id: b.id,
        startDate: b.checkIn,
        endDate: b.checkOut,
        status: b.status,
      })),
    };
  }

  async createBookingAndPayment(
    booking: CreateBookingData,
    paymentIntentId: string,
    events: DomainEvent[],
  ): Promise<BookingSnapshot> {
    const newBooking = await this.prisma.$transaction(
      async (tx) => {
        const b = await tx.booking.create({
          data: {
            propertyId: booking.propertyId,
            guestId: booking.guestId,
            organizationId: booking.organizationId,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guests: booking.guests,
            totalPrice: booking.totalPrice,
            status: booking.status as 'PENDING',
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
            bookingId: b.id,
            organizationId: booking.organizationId,
            amount: booking.totalPrice,
            currency: 'usd',
            stripePaymentIntentId: paymentIntentId,
            status: 'PENDING',
          },
        });

        const outboxEvents = events ?? [];
        if (outboxEvents.length > 0) {
          const anyTx = tx as any;
          if (anyTx.outboxEvent?.createMany) {
            await anyTx.outboxEvent.createMany({
              data: outboxEvents.map((e: DomainEvent) => ({
                aggregateId: b.id,
                type: e.type,
                payload: e.payload,
              })),
            });
          }
        }

        return b;
      },
      { isolationLevel: 'Serializable' as const },
    );

    return this.toSnapshot(newBooking);
  }

  async findById(
    id: string,
    organizationId?: string | null,
  ): Promise<BookingSnapshot | null> {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) where.organizationId = organizationId;

    const b = await this.prisma.booking.findFirst({
      where,
      include: {
        property: {
          include: {
            host: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        guest: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        payment: true,
      },
    });
    return b ? this.toSnapshot(b) : null;
  }

  async findByIdForHost(
    id: string,
    hostId: string,
    organizationId?: string | null,
  ): Promise<BookingSnapshot | null> {
    const where: {
      id: string;
      property: { hostId: string; organizationId?: string };
    } = { id, property: { hostId } };
    if (organizationId) where.property.organizationId = organizationId;

    const b = await this.prisma.booking.findFirst({
      where,
      include: {
        property: true,
        guest: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        payment: true,
      },
    });
    return b ? this.toSnapshot(b) : null;
  }

  async updateBookingStatus(
    id: string,
    status: string,
    events: DomainEvent[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: status as any },
      });

      const outboxEvents = events ?? [];
      if (outboxEvents.length > 0) {
        const anyTx = tx as any;
        if (anyTx.outboxEvent?.createMany) {
          await anyTx.outboxEvent.createMany({
            data: outboxEvents.map((e: DomainEvent) => ({
              aggregateId: id,
              type: e.type,
              payload: e.payload,
            })),
          });
        }
      }
    });
  }

  async setHold(
    bookingId: string,
    guestId: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (this.redisPort.isAvailable()) {
      await this.redisPort.set(
        `${HOLD_KEY_PREFIX}${bookingId}`,
        guestId,
        ttlSeconds,
      );
    }
  }

  async deleteHold(bookingId: string): Promise<void> {
    if (this.redisPort.isAvailable()) {
      await this.redisPort.del(`${HOLD_KEY_PREFIX}${bookingId}`);
    }
  }

  async findAllByGuest(
    guestId: string,
    organizationId: string,
  ): Promise<BookingSnapshot[]> {
    const list = await this.prisma.booking.findMany({
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
    return list.map((b) => this.toSnapshot(b));
  }

  async findAllByHost(
    hostId: string,
    organizationId?: string | null,
  ): Promise<BookingSnapshot[]> {
    const where: { property: { hostId: string; organizationId?: string } } = {
      property: { hostId },
    };
    if (organizationId) where.property.organizationId = organizationId;

    const list = await this.prisma.booking.findMany({
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
    return list.map((b) => this.toSnapshot(b));
  }

  private toSnapshot(b: any): BookingSnapshot {
    return {
      id: b.id,
      propertyId: b.propertyId,
      guestId: b.guestId,
      organizationId: b.organizationId,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      property: b.property,
      guest: b.guest,
      payment: b.payment,
    };
  }
}
