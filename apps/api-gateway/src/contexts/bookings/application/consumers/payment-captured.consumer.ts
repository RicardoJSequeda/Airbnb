import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaBookingsClient } from '../../infrastructure/prisma-bookings.client';
import { ConsumerRegistryService } from '../../../../platform/messaging/consumers/consumer-registry.service';
import {
  PAYMENT_CAPTURED_V1_TOPIC,
  parsePaymentCapturedV1Event,
} from '../../../payments/contracts/events/payment-captured.v1.event';

@Injectable()
export class PaymentCapturedConsumer implements OnModuleInit {
  readonly consumerGroup = 'bookings.payment-captured.v1';

  constructor(
    private readonly bookingsClient: PrismaBookingsClient,
    private readonly registry: ConsumerRegistryService,
  ) {}

  onModuleInit(): void {
    this.registry.register({
      consumerGroup: this.consumerGroup,
      topic: PAYMENT_CAPTURED_V1_TOPIC,
      handle: async (message) => {
        const event = parsePaymentCapturedV1Event({
          name: 'payment.captured',
          version: 'v1',
          metadata: {
            eventId: message.eventId,
            occurredAt: new Date().toISOString(),
            correlationId: message.correlationId ?? 'n/a',
          },
          payload: message.payload,
        });

        await this.bookingsClient.bookingSummary.updateMany({
          where: { bookingId: event.payload.bookingId },
          data: { paymentStatus: 'CAPTURED' },
        });
      },
    });
  }
}
