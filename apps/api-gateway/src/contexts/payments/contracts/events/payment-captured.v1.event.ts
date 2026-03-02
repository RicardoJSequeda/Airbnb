import {
  assertMetadata,
  assertNumber,
  assertString,
  type BaseIntegrationEvent,
} from '../../../shared-kernel/events/base-integration.event';

export const PAYMENT_CAPTURED_V1_TOPIC = 'payment.captured.v1';

export interface PaymentCapturedV1Payload {
  paymentId: string;
  bookingId: string;
  organizationId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  capturedAt: string;
}

export type PaymentCapturedV1Event = BaseIntegrationEvent<
  'payment.captured',
  PaymentCapturedV1Payload
>;

export function parsePaymentCapturedV1Event(
  input: unknown,
): PaymentCapturedV1Event {
  const event = input as Record<string, unknown>;
  const payload = event.payload as Record<string, unknown>;

  return {
    name: 'payment.captured',
    version: 'v1',
    metadata: assertMetadata(event.metadata),
    payload: {
      paymentId: assertString(payload.paymentId, 'payload.paymentId'),
      bookingId: assertString(payload.bookingId, 'payload.bookingId'),
      organizationId: assertString(
        payload.organizationId,
        'payload.organizationId',
      ),
      amount: assertNumber(payload.amount, 'payload.amount'),
      currency: assertString(payload.currency, 'payload.currency'),
      stripePaymentIntentId: assertString(
        payload.stripePaymentIntentId,
        'payload.stripePaymentIntentId',
      ),
      capturedAt: assertString(payload.capturedAt, 'payload.capturedAt'),
    },
  };
}
