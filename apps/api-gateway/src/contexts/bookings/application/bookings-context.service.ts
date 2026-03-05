import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../../bookings/bookings.service';
import type {
  BookingContextPort,
  CreateBookingCommand,
} from '../contracts/bookings-context.port';

@Injectable()
export class BookingsContextService implements BookingContextPort {
  constructor(private readonly bookingsService: BookingsService) {}

  create(command: CreateBookingCommand, guestId: string, organizationId: string) {
    return this.bookingsService.create(command, guestId, organizationId);
  }

  findAllByGuest(guestId: string, organizationId: string) {
    return this.bookingsService.findAllByGuest(guestId, organizationId);
  }

  findAllByHost(hostId: string, organizationId?: string | null) {
    return this.bookingsService.findAllByHost(hostId, organizationId);
  }

  findOne(id: string, userId: string, organizationId?: string | null) {
    return this.bookingsService.findOne(id, userId, organizationId);
  }

  cancel(id: string, userId: string, organizationId?: string | null) {
    return this.bookingsService.cancel(id, userId, organizationId);
  }

  confirm(id: string, hostId: string, organizationId?: string | null) {
    return this.bookingsService.confirm(id, hostId, organizationId);
  }

  reject(id: string, hostId: string, organizationId?: string | null) {
    return this.bookingsService.reject(id, hostId, organizationId);
  }
}
