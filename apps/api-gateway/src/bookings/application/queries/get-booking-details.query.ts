import { Inject, Injectable } from '@nestjs/common';
import type { IBookingsQueryRepository } from '../../domain/ports/bookings-query.repository';

@Injectable()
export class GetBookingDetailsQuery {
  constructor(
    @Inject('IBookingsQueryRepository')
    private readonly queryRepository: IBookingsQueryRepository,
  ) {}

  async execute(bookingId: string) {
    return this.queryRepository.findBookingDetails(bookingId);
  }
}
