import { Inject, Injectable } from '@nestjs/common';
import type { IBookingsQueryRepository } from '../../domain/ports/bookings-query.repository';

@Injectable()
export class GetBookingsByGuestQuery {
  constructor(
    @Inject('IBookingsQueryRepository')
    private readonly queryRepository: IBookingsQueryRepository,
  ) {}

  async execute(guestId: string, organizationId: string) {
    return this.queryRepository.findByGuest(guestId, organizationId);
  }
}
