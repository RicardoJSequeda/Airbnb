export interface PaymentEventMetadataV1 {
  eventId: string;
  occurredAt: string;
  correlationId: string;
}

export interface PaymentCapturedV1Payload {
  paymentId: string;
  bookingId: string;
  organizationId: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  capturedAt: string;
}

export interface PaymentCapturedV1Event {
  name: 'payment.captured';
  version: 'v1';
  metadata: PaymentEventMetadataV1;
  payload: PaymentCapturedV1Payload;
}
