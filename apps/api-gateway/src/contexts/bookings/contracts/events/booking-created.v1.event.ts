export interface EventMetadataV1 {
  eventId: string;
  occurredAt: string;
  correlationId: string;
}

export interface BookingCreatedV1Payload {
  bookingId: string;
  propertyId: string;
  guestId: string;
  organizationId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  currency: string;
}

export interface BookingCreatedV1Event {
  name: 'booking.created';
  version: 'v1';
  metadata: EventMetadataV1;
  payload: BookingCreatedV1Payload;
}
