import { Injectable } from '@nestjs/common';
import { PrismaBookingsClient } from '../../contexts/bookings/infrastructure/prisma-bookings.client';
import type { IBookingsQueryRepository } from '../domain/ports/bookings-query.repository';
import type { BookingDetailsReadModel } from '../domain/read-models/booking-details.read-model';
import type { BookingListByGuestReadModel } from '../domain/read-models/booking-list-by-guest.read-model';
import type { BookingListByHostReadModel } from '../domain/read-models/booking-list-by-host.read-model';

@Injectable()
export class PrismaBookingsQueryRepository implements IBookingsQueryRepository {
  constructor(private readonly prisma: PrismaBookingsClient) {}

  async findBookingDetails(
    bookingId: string,
  ): Promise<BookingDetailsReadModel | null> {
    const item = await this.prisma.bookingSummary.findUnique({
      where: { bookingId },
    });

    if (!item) return null;
    return {
      bookingId: item.bookingId,
      propertyId: item.propertyId,
      guestId: item.guestId,
      hostId: item.hostId,
      organizationId: item.organizationId,
      tenantId: item.tenantId,
      regionId: item.regionId,
      status: item.status,
      paymentStatus: item.paymentStatus,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt,
    };
  }

  async findByGuest(
    guestId: string,
    organizationId: string,
  ): Promise<BookingListByGuestReadModel[]> {
    const list = await this.prisma.bookingSummary.findMany({
      where: { guestId, organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        bookingId: true,
        propertyId: true,
        guestId: true,
        status: true,
        paymentStatus: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    return list.map((item) => ({
      bookingId: item.bookingId,
      propertyId: item.propertyId,
      guestId: item.guestId,
      status: item.status,
      paymentStatus: item.paymentStatus,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt,
    }));
  }

  async findByHost(
    hostId: string,
    organizationId?: string,
  ): Promise<BookingListByHostReadModel[]> {
    const list = await this.prisma.bookingSummary.findMany({
      where: {
        hostId,
        ...(organizationId ? { organizationId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        bookingId: true,
        propertyId: true,
        hostId: true,
        status: true,
        paymentStatus: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    return list.map((item) => ({
      bookingId: item.bookingId,
      propertyId: item.propertyId,
      hostId: item.hostId,
      status: item.status,
      paymentStatus: item.paymentStatus,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt,
    }));
  }
}
