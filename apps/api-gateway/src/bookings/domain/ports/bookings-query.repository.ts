import type { BookingDetailsReadModel } from '../read-models/booking-details.read-model';
import type { BookingListByGuestReadModel } from '../read-models/booking-list-by-guest.read-model';
import type { BookingListByHostReadModel } from '../read-models/booking-list-by-host.read-model';

export interface IBookingsQueryRepository {
  findBookingDetails(
    bookingId: string,
  ): Promise<BookingDetailsReadModel | null>;
  findByGuest(
    guestId: string,
    organizationId: string,
  ): Promise<BookingListByGuestReadModel[]>;
  findByHost(
    hostId: string,
    organizationId?: string,
  ): Promise<BookingListByHostReadModel[]>;
}
