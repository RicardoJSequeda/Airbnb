import { Inject, Injectable } from '@nestjs/common';
import type { IBookingsQueryRepository } from '../../domain/ports/bookings-query.repository';

@Injectable()
export class GetBookingsByHostQuery {
  constructor(
    @Inject('IBookingsQueryRepository')
    private readonly queryRepository: IBookingsQueryRepository,
  ) {}

  async execute(hostId: string, organizationId?: string) {
    return this.queryRepository.findByHost(hostId, organizationId);
  }
}
