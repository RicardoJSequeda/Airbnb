import {
  assertMetadata,
  assertString,
  type BaseIntegrationEvent,
} from '../../../shared-kernel/events/base-integration.event';

export const BOOKING_CANCELLED_V1_TOPIC = 'booking.cancelled.v1';

export interface BookingCancelledV1Payload {
  bookingId: string;
  cancelledByUserId: string;
  organizationId: string;
  reason?: string;
}

export type BookingCancelledV1Event = BaseIntegrationEvent<
  'booking.cancelled',
  BookingCancelledV1Payload
>;

export function parseBookingCancelledV1Event(
  input: unknown,
): BookingCancelledV1Event {
  const event = input as Record<string, unknown>;
  const payload = event.payload as Record<string, unknown>;

  return {
    name: 'booking.cancelled',
    version: 'v1',
    metadata: assertMetadata(event.metadata),
    payload: {
      bookingId: assertString(payload.bookingId, 'payload.bookingId'),
      cancelledByUserId: assertString(
        payload.cancelledByUserId,
        'payload.cancelledByUserId',
      ),
      organizationId: assertString(
        payload.organizationId,
        'payload.organizationId',
      ),
      reason: typeof payload.reason === 'string' ? payload.reason : undefined,
    },
  };
}
