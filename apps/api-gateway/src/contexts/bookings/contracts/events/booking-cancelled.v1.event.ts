import type { EventMetadataV1 } from './booking-created.v1.event';

export interface BookingCancelledV1Payload {
  bookingId: string;
  cancelledByUserId: string;
  organizationId: string;
  reason?: string;
}

export interface BookingCancelledV1Event {
  name: 'booking.cancelled';
  version: 'v1';
  metadata: EventMetadataV1;
  payload: BookingCancelledV1Payload;
}
