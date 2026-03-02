import {
  assertMetadata,
  assertNumber,
  assertString,
  type BaseIntegrationEvent,
} from '../../../shared-kernel/events/base-integration.event';

export const BOOKING_CREATED_V1_TOPIC = 'booking.created.v1';

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

export type BookingCreatedV1Event = BaseIntegrationEvent<
  'booking.created',
  BookingCreatedV1Payload
>;

export function parseBookingCreatedV1Event(
  input: unknown,
): BookingCreatedV1Event {
  const event = input as Record<string, unknown>;
  const payload = event.payload as Record<string, unknown>;

  return {
    name: 'booking.created',
    version: 'v1',
    metadata: assertMetadata(event.metadata),
    payload: {
      bookingId: assertString(payload.bookingId, 'payload.bookingId'),
      propertyId: assertString(payload.propertyId, 'payload.propertyId'),
      guestId: assertString(payload.guestId, 'payload.guestId'),
      organizationId: assertString(
        payload.organizationId,
        'payload.organizationId',
      ),
      checkIn: assertString(payload.checkIn, 'payload.checkIn'),
      checkOut: assertString(payload.checkOut, 'payload.checkOut'),
      guests: assertNumber(payload.guests, 'payload.guests'),
      totalPrice: assertNumber(payload.totalPrice, 'payload.totalPrice'),
      currency: assertString(payload.currency, 'payload.currency'),
    },
  };
}
