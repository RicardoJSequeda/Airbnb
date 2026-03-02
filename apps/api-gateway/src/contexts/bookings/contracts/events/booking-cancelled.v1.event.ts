 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
import {
  assertMetadata,
  assertString,
  enforceEventEnvelope,
  type BaseIntegrationEvent,
} from '../../../shared-kernel/events/base-integration.event';

export const BOOKING_CANCELLED_V1_TOPIC = 'booking.cancelled.v1';

import type { EventMetadataV1 } from './booking-created.v1.event';
main

export interface BookingCancelledV1Payload {
  bookingId: string;
  cancelledByUserId: string;
  organizationId: string;
  reason?: string;
}

 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
export type BookingCancelledV1Event = BaseIntegrationEvent<
  'booking.cancelled',
  BookingCancelledV1Payload
>;

export function parseBookingCancelledV1Event(
  input: unknown,
): BookingCancelledV1Event {
  const event = enforceEventEnvelope(input, 'booking.cancelled');
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

export interface BookingCancelledV1Event {
  name: 'booking.cancelled';
  version: 'v1';
  metadata: EventMetadataV1;
  payload: BookingCancelledV1Payload;
main
}
